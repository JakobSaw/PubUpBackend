const findCurrentIncentives = (allIncentives, pushFullIncentive) => {
    const allCurrentIncentivesIDs = [];

    allIncentives.forEach((current) => {
        if (current.repeat) {
            const currentDate = new Date();
            const currentDay = currentDate.getDay();
            const currentTime = parseInt(
                `${
                    currentDate.getHours() < 10
                        ? `0${currentDate.getHours()}`
                        : currentDate.getHours()
                }${
                    currentDate.getMinutes() < 10
                        ? `0${currentDate.getMinutes()}`
                        : currentDate.getMinutes()
                }`
            );
            const currentDayIncentive = current.weekdays[currentDay];
            if (
                typeof currentDayIncentive === "string" &&
                allCurrentIncentivesIDs.indexOf(current.lokal_id) < 0
            ) {
                allCurrentIncentivesIDs.push(
                    pushFullIncentive ? current : current.lokal_id
                );
            } else if (
                Array.isArray(currentDayIncentive) &&
                !!currentDayIncentive.length
            ) {
                currentDayIncentive.forEach((inc) => {
                    // console.log("currentTime :>> ", currentTime);
                    // console.log("current :>> ", inc[0]);
                    // console.log("currentDayIncentive[index + 1] :>> ", inc[1]);
                    let start = inc[0];
                    let end = inc[1];
                    if (start > end) {
                        start = inc[1];
                        end = inc[0];
                    }
                    if (
                        currentTime >= start &&
                        currentTime <= end &&
                        ((!pushFullIncentive &&
                            allCurrentIncentivesIDs.indexOf(current.lokal_id) <
                                0) ||
                            (pushFullIncentive &&
                                !allCurrentIncentivesIDs.some(
                                    (c) =>
                                        c.incentive_id === current.incentive_id
                                )))
                    ) {
                        allCurrentIncentivesIDs.push(
                            pushFullIncentive ? current : current.lokal_id
                        );
                    }
                });
            }
        } else {
            let currentUnix = Date.now();
            if (current.single_Start && current.single_End) {
                if (
                    current.single_Start &&
                    Date.now().toString().length >
                        current.single_Start.toString().length
                ) {
                    currentUnix = currentUnix / 1000;
                }
                if (
                    currentUnix > current.single_Start &&
                    currentUnix < current.single_End &&
                    allCurrentIncentivesIDs.indexOf(current.lokal_id) < 0
                ) {
                    allCurrentIncentivesIDs.push(
                        pushFullIncentive ? current : current.lokal_id
                    );
                }
            }
        }
    });
    return allCurrentIncentivesIDs;
};

module.exports = findCurrentIncentives;
