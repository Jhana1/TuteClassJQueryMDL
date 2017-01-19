// ==== Fake Geolocation code ====

// GeoLocation hacking for testing code:
new FakeGeolocation(5);

// Class constructor to initialise/reinitialise Geolocation replay
// code after fakeSelectRegion() has been called.  Each new instance
// of this class replaces any previous ones in faking geolocation API.
function FakeGeolocation(regionIndex)
{
    if (typeof regionIndex === 'undefined')
    {
        regionIndex = 0;    
    }
    
    var watchSuccessFunctions = [];
    var recordedPositions = [];
    var lastRecordedPosition = null;
    var beginReplayTime = null;
    var firstRecordedPositionTime = null;
    var numberOfWatchers = 0;
    var startedReplayingPositions = false;
    var useFakeGeolocation = true;
    var prerecordedRegionIndex = regionIndex;
    var currentGeolocationEventIndex = 0;
    
    var SHORT_TIMEOUT = 200;
    
    function initialise()
    {
        if (useFakeGeolocation &&
            (prerecordedRegions[prerecordedRegionIndex].locations != null))
        {
            // Replay prerecorded geolocation events.
            watchSuccessFunctions = [];
            recordedPositions = [];
            lastRecordedPosition = null;
            beginReplayTime = null;
            firstRecordedPositionTime = null;
            numberOfWatchers = 0;
            startedReplayingPositions = false;
            navigator.geolocation.watchPosition = fakeWatchPosition;
            navigator.geolocation.clearWatch = fakeClearWatch;
            navigator.geolocation.getCurrentPosition = fakeGetCurrentPosition;
        }
        else
        {
            // Use the standard JavaScript Geolocation API.
            delete navigator.geolocation.watchPosition;
            delete navigator.geolocation.clearWatch;
            delete navigator.geolocation.getCurrentPosition;
        }
    }
    
    // Select the geolocation replay to use from the
    // prerecordedRegions array.  An index for zero uses the 
    // standard JavaScript Geolocation API.
    function fakeSelectRegion(index)
    {
        var resultsList = document.getElementById("results-list");

        var listItem = resultsList.children[prerecordedRegionIndex + 2];
        $(listItem).find('.ui-btn').removeClass('ui-btn-icon-right').removeClass('ui-icon-check');

        prerecordedRegionIndex = index;

        listItem = resultsList.children[prerecordedRegionIndex + 2];
        $(listItem).find('.ui-btn').addClass('ui-btn-icon-right').addClass('ui-icon-check');
    }


    // Event for simulating each position in replayed
    // Geolocation API recording.
    function fakePositionEvent()
    {
        if (beginReplayTime == null)
        {
            // We are beginning a replay.

            // Select the Geolocation recording to use.
            recordedPositions = prerecordedRegions[prerecordedRegionIndex].locations.slice();

            // Time we started this replay.
            beginReplayTime = Date.now();

            // The time of the first position recorded in the recording.
            firstRecordedPositionTime = recordedPositions[0].timestamp;

        }
        console.log("FakeGeolocationEventIndex: " + currentGeolocationEventIndex++)


        // Remove and remember the next recorded position.
        lastRecordedPosition = recordedPositions.shift();

        // Call the success callback function for all watches 
        // that haven't been cleared (i.e., are null) with the
        // new position.
        for (var i = 0; i < numberOfWatchers; ++i)
        {
            var successFunction = watchSuccessFunctions[i];
            if (successFunction != null)
            {
                successFunction(lastRecordedPosition);
            }
        }

        // If there are further positions in the recording,
        // schedule an event for the next one after a time
        // based on the time between events in the original
        // recording.
        if (recordedPositions.length > 0)
        {
            var nextTimestamp = recordedPositions[0].timestamp;
            var diff = nextTimestamp - lastRecordedPosition.timestamp;
            setTimeout(fakePositionEvent, diff);
        }
    }

    // Replacement for navigator.geolocation.watchPosition()
    function fakeWatchPosition(success, error, options)
    {
        // Add success function to watchSuccessFunctions array.
        watchSuccessFunctions[numberOfWatchers] = success;

        // Start the geolocation replay if not started.
        if (!startedReplayingPositions)
        {
            // We want to behave like the geolocation API and 
            // call the success callback function on the idle
            // loop, so do this with a short timeout.
            setTimeout(fakePositionEvent, SHORT_TIMEOUT);
            startedReplayingPositions = true;
        }

        return numberOfWatchers++;
    }

    // Replacement for navigator.geolocation.clearWatch()
    function fakeClearWatch(id)
    {
        watchSuccessFunctions[id] = null;
    }

    // Replacement for navigator.geolocation.getCurrentPosition()
    function fakeGetCurrentPosition(success, error, options)
    {
        // We want to behave like the geolocation API and 
        // call the success callback function on the idle
        // loop, so do this with a short timeout.
        setTimeout(fakeCurrentPositionEvent, SHORT_TIMEOUT, success);
    }

    // Code for getCurrentPosition, called on the idle loop.
    function fakeCurrentPositionEvent(success)
    {
        // Start the geolocation replay if not started.
        if (!startedReplayingPositions)
        {
            fakePositionEvent();
            startedReplayingPositions = true;
        }

        if (lastRecordedPosition != null)
        {
            // Update the timestamp for the returned position.
            var timeDiff = Date.now() - beginReplayTime;
            lastRecordedPosition.timestamp = 
                    firstRecordedPositionTime + timeDiff;

            // Call the success callback with the position.
            success(lastRecordedPosition)
        }
        else
        {
            // It might be possible we've scheduled the first 
            // position event but haven't see it yet.  If so, 
            // wait for it.
            setTimeout(fakeCurrentPositionEvent, SHORT_TIMEOUT, success);
        }
    }


    var prerecordedRegions = [
        {
            title: "Standard",
            locations: null
        },
        {
            title: "Simulate: NH to Campus Centre",
            locations: [
                            {
                    "coords": {
                        "accuracy": 320.07388262534585,
                        "altitude": 93.04071807861328,
                        "altitudeAccuracy": 23.099118487560165,
                        "heading": null,
                        "latitude": -37.907617399444455,
                        "longitude": 145.13272104896626,
                        "speed": null
                    },
                    "timestamp": 1433726984011
                },
                {
                    "coords": {
                        "accuracy": 422.1742353935144,
                        "altitude": 93.04071807861328,
                        "altitudeAccuracy": 23.099118487560165,
                        "heading": null,
                        "latitude": -37.907324836350384,
                        "longitude": 145.13313421515258,
                        "speed": null
                    },
                    "timestamp": 1433726990593
                },
                {
                    "coords": {
                        "accuracy": 422.17438268318034,
                        "altitude": 93.04071807861328,
                        "altitudeAccuracy": 23.099118487560165,
                        "heading": null,
                        "latitude": -37.9071596357441,
                        "longitude": 145.13336751629637,
                        "speed": null
                    },
                    "timestamp": 1433726990607
                },
                {
                    "coords": {
                        "accuracy": 422.1745090583816,
                        "altitude": 93.04071807861328,
                        "altitudeAccuracy": 23.099118487560165,
                        "heading": null,
                        "latitude": -37.907001499421966,
                        "longitude": 145.13359084105076,
                        "speed": null
                    },
                    "timestamp": 1433726990620
                },
                {
                    "coords": {
                        "accuracy": 422.174721249932,
                        "altitude": 93.04071807861328,
                        "altitudeAccuracy": 23.099118487560165,
                        "heading": null,
                        "latitude": -37.9068500434377,
                        "longitude": 145.13380473163602,
                        "speed": null
                    },
                    "timestamp": 1433726990637
                },
                {
                    "coords": {
                        "accuracy": 65,
                        "altitude": 104.04158020019531,
                        "altitudeAccuracy": 13.241966259213783,
                        "heading": null,
                        "latitude": -37.90826732420547,
                        "longitude": 145.13240854923902,
                        "speed": null
                    },
                    "timestamp": 1433726990914
                },
                {
                    "coords": {
                        "accuracy": 254.2337789350806,
                        "altitude": 104.04158020019531,
                        "altitudeAccuracy": 13.241966259213783,
                        "heading": null,
                        "latitude": -37.90826526993911,
                        "longitude": 145.13240906751275,
                        "speed": null
                    },
                    "timestamp": 1433726999928
                },
                {
                    "coords": {
                        "accuracy": 50,
                        "altitude": 98.00482177734375,
                        "altitudeAccuracy": 16,
                        "heading": 193.0078125,
                        "latitude": -37.90874035101189,
                        "longitude": 145.1320349147032,
                        "speed": 1.8700000047683716
                    },
                    "timestamp": 1433727009150
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 87.34173583984375,
                        "altitudeAccuracy": 16,
                        "heading": 269.296875,
                        "latitude": -37.908708164503714,
                        "longitude": 145.13245535096632,
                        "speed": 0.8700000047683716
                    },
                    "timestamp": 1433727010166
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 90.9429931640625,
                        "altitudeAccuracy": 12,
                        "heading": 258.75,
                        "latitude": -37.90866780563994,
                        "longitude": 145.13240170678603,
                        "speed": 1.0099999904632568
                    },
                    "timestamp": 1433727011081
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 92.4473876953125,
                        "altitudeAccuracy": 8,
                        "heading": 264.7265625,
                        "latitude": -37.90864102545931,
                        "longitude": 145.13235418139504,
                        "speed": 1.6200000047683716
                    },
                    "timestamp": 1433727012050
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 90.09234619140625,
                        "altitudeAccuracy": 6,
                        "heading": 257.6953125,
                        "latitude": -37.90862497411474,
                        "longitude": 145.13232031850623,
                        "speed": 1.7200000286102295
                    },
                    "timestamp": 1433727013048
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 93.29071044921875,
                        "altitudeAccuracy": 8,
                        "heading": 258.3984375,
                        "latitude": -37.90862384255781,
                        "longitude": 145.13229517279672,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1433727014059
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 93.9620361328125,
                        "altitudeAccuracy": 8,
                        "heading": 238.7109375,
                        "latitude": -37.90863205682292,
                        "longitude": 145.132280085371,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1433727015059
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.072021484375,
                        "altitudeAccuracy": 8,
                        "heading": 235.546875,
                        "latitude": -37.90864429440155,
                        "longitude": 145.13226298628854,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1433727016050
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.69854736328125,
                        "altitudeAccuracy": 8,
                        "heading": 221.484375,
                        "latitude": -37.90866315368368,
                        "longitude": 145.13224957524346,
                        "speed": 1.6100000143051147
                    },
                    "timestamp": 1433727017048
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.43927001953125,
                        "altitudeAccuracy": 8,
                        "heading": 214.8046875,
                        "latitude": -37.90868796411707,
                        "longitude": 145.13223834349319,
                        "speed": 1.7699999809265137
                    },
                    "timestamp": 1433727018058
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.49737548828125,
                        "altitudeAccuracy": 8,
                        "heading": 214.8046875,
                        "latitude": -37.90871457665964,
                        "longitude": 145.13222903958066,
                        "speed": 2.0399999618530273
                    },
                    "timestamp": 1433727019077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.04534912109375,
                        "altitudeAccuracy": 6,
                        "heading": 220.78125,
                        "latitude": -37.90874160829737,
                        "longitude": 145.13222426189586,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1433727020045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.63177490234375,
                        "altitudeAccuracy": 6,
                        "heading": 220.078125,
                        "latitude": -37.90876507762625,
                        "longitude": 145.13221948421105,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1433727021055
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.38720703125,
                        "altitudeAccuracy": 6,
                        "heading": 220.078125,
                        "latitude": -37.90878842122658,
                        "longitude": 145.13221202431723,
                        "speed": 1.4900000095367432
                    },
                    "timestamp": 1433727022062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.63720703125,
                        "altitudeAccuracy": 6,
                        "heading": 196.875,
                        "latitude": -37.908811261912724,
                        "longitude": 145.132206156985,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433727023083
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.8697509765625,
                        "altitudeAccuracy": 4,
                        "heading": 196.171875,
                        "latitude": -37.908830288832924,
                        "longitude": 145.13220515115663,
                        "speed": 1.059999942779541
                    },
                    "timestamp": 1433727024073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.9912109375,
                        "altitudeAccuracy": 4,
                        "heading": 196.5234375,
                        "latitude": -37.90884214922591,
                        "longitude": 145.1322085039179,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1433727025062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 100.0565185546875,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.90885493162825,
                        "longitude": 145.13221546089753,
                        "speed": 1.2799999713897705
                    },
                    "timestamp": 1433727026062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.837158203125,
                        "altitudeAccuracy": 4,
                        "heading": 170.859375,
                        "latitude": -37.90886758830204,
                        "longitude": 145.1322225016962,
                        "speed": 1.100000023841858
                    },
                    "timestamp": 1433727027084
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.964599609375,
                        "altitudeAccuracy": 4,
                        "heading": 170.859375,
                        "latitude": -37.90887718558117,
                        "longitude": 145.13222878812357,
                        "speed": 0.6100000143051147
                    },
                    "timestamp": 1433727028062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.30133056640625,
                        "altitudeAccuracy": 3,
                        "heading": 170.5078125,
                        "latitude": -37.90888556748434,
                        "longitude": 145.13223641565546,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1433727029064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.354736328125,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.90889369793042,
                        "longitude": 145.13224571956798,
                        "speed": 1.2000000476837158
                    },
                    "timestamp": 1433727030063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.4215087890625,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.908898978529415,
                        "longitude": 145.1322560293089,
                        "speed": 0.8199999928474426
                    },
                    "timestamp": 1433727031063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.6016845703125,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.90890308566197,
                        "longitude": 145.13226826688754,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1433727032084
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.37847900390625,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.908906145056626,
                        "longitude": 145.1322840248655,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1433727033064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.52191162109375,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.908908785356125,
                        "longitude": 145.1322993637483,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1433727034065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.788818359375,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.90891238957449,
                        "longitude": 145.13231277479338,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1433727035083
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.7822265625,
                        "altitudeAccuracy": 4,
                        "heading": 170.5078125,
                        "latitude": -37.908917586354455,
                        "longitude": 145.1323236712675,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1433727036062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.33758544921875,
                        "altitudeAccuracy": 4,
                        "heading": 127.6171875,
                        "latitude": -37.90892533961489,
                        "longitude": 145.13233733376967,
                        "speed": 1.5199999809265137
                    },
                    "timestamp": 1433727037064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.49969482421875,
                        "altitudeAccuracy": 4,
                        "heading": 135,
                        "latitude": -37.90893535598918,
                        "longitude": 145.13234990662443,
                        "speed": 1.1799999475479126
                    },
                    "timestamp": 1433727038066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.86090087890625,
                        "altitudeAccuracy": 4,
                        "heading": 143.7890625,
                        "latitude": -37.908944617992184,
                        "longitude": 145.1323577856134,
                        "speed": 1.100000023841858
                    },
                    "timestamp": 1433727039064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.70843505859375,
                        "altitudeAccuracy": 3,
                        "heading": 167.6953125,
                        "latitude": -37.908957442304036,
                        "longitude": 145.13236155746984,
                        "speed": 1.4600000381469727
                    },
                    "timestamp": 1433727040065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.6858593620276,
                        "altitudeAccuracy": 3,
                        "heading": 181.7578125,
                        "latitude": -37.90897349364861,
                        "longitude": 145.13236021636533,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433727041062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.61542357975655,
                        "altitudeAccuracy": 3,
                        "heading": 184.21875,
                        "latitude": -37.9089869466032,
                        "longitude": 145.13235703124212,
                        "speed": 1.1799999475479126
                    },
                    "timestamp": 1433727042067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.49478503259658,
                        "altitudeAccuracy": 3,
                        "heading": 187.03125,
                        "latitude": -37.90900006428166,
                        "longitude": 145.13235468430923,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1433727043083
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.02168531145142,
                        "altitudeAccuracy": 3,
                        "heading": 186.328125,
                        "latitude": -37.909012888593516,
                        "longitude": 145.13235359466182,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433727044062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.01876336599031,
                        "altitudeAccuracy": 3,
                        "heading": 172.265625,
                        "latitude": -37.90902550335779,
                        "longitude": 145.13235476812827,
                        "speed": 1.7100000381469727
                    },
                    "timestamp": 1433727045074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.5933062090818,
                        "altitudeAccuracy": 3,
                        "heading": 172.265625,
                        "latitude": -37.90903916585996,
                        "longitude": 145.13235661214696,
                        "speed": 1.7000000476837158
                    },
                    "timestamp": 1433727046072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.68756584772936,
                        "altitudeAccuracy": 3,
                        "heading": 172.265625,
                        "latitude": -37.90905127771004,
                        "longitude": 145.13235837234663,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433727047083
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.69148112692217,
                        "altitudeAccuracy": 3,
                        "heading": 172.265625,
                        "latitude": -37.90906355719819,
                        "longitude": 145.1323601325463,
                        "speed": 1.5499999523162842
                    },
                    "timestamp": 1433727048070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.69685081576537,
                        "altitudeAccuracy": 3,
                        "heading": 172.265625,
                        "latitude": -37.90907646532907,
                        "longitude": 145.13236105455564,
                        "speed": 1.5
                    },
                    "timestamp": 1433727049070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.51488615227004,
                        "altitudeAccuracy": 3,
                        "heading": 177.5390625,
                        "latitude": -37.90908861908867,
                        "longitude": 145.1323628147553,
                        "speed": 1.5199999809265137
                    },
                    "timestamp": 1433727050072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.29892563744724,
                        "altitudeAccuracy": 4,
                        "heading": 180.703125,
                        "latitude": -37.90910047948166,
                        "longitude": 145.13236365294563,
                        "speed": 1.6799999475479126
                    },
                    "timestamp": 1433727051089
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.17944770947186,
                        "altitudeAccuracy": 4,
                        "heading": 179.6484375,
                        "latitude": -37.90911145977481,
                        "longitude": 145.13236449113595,
                        "speed": 1.559999942779541
                    },
                    "timestamp": 1433727052075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.0107760836499,
                        "altitudeAccuracy": 4,
                        "heading": 171.9140625,
                        "latitude": -37.909120344592175,
                        "longitude": 145.1323628147553,
                        "speed": 1.0399999618530273
                    },
                    "timestamp": 1433727053074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.82216847314831,
                        "altitudeAccuracy": 4,
                        "heading": 171.9140625,
                        "latitude": -37.909126714838585,
                        "longitude": 145.13236030018436,
                        "speed": 0.8799999952316284
                    },
                    "timestamp": 1433727054070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.67773005016456,
                        "altitudeAccuracy": 6,
                        "heading": 196.875,
                        "latitude": -37.90913484528466,
                        "longitude": 145.13235493576633,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1433727055088
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.87756339718705,
                        "altitudeAccuracy": 6,
                        "heading": 190.546875,
                        "latitude": -37.909145951306364,
                        "longitude": 145.13235040953862,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433727056072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.9054669186477,
                        "altitudeAccuracy": 4,
                        "heading": 192.3046875,
                        "latitude": -37.909154542757115,
                        "longitude": 145.1323463862251,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1433727057106
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.98485572958023,
                        "altitudeAccuracy": 6,
                        "heading": 184.5703125,
                        "latitude": -37.909165355412206,
                        "longitude": 145.1323442907493,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433727058045
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.22456222792044,
                        "altitudeAccuracy": 6,
                        "heading": 185.2734375,
                        "latitude": -37.909179520828566,
                        "longitude": 145.13234253054964,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1433727059059
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.08660718985173,
                        "altitudeAccuracy": 6,
                        "heading": 182.109375,
                        "latitude": -37.909196326544425,
                        "longitude": 145.13233984834062,
                        "speed": 1.75
                    },
                    "timestamp": 1433727060084
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.02845613583112,
                        "altitudeAccuracy": 4,
                        "heading": 180.703125,
                        "latitude": -37.909210785327396,
                        "longitude": 145.13233942924546,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433727061072
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.87384565750004,
                        "altitudeAccuracy": 4,
                        "heading": 178.2421875,
                        "latitude": -37.90922218471571,
                        "longitude": 145.1323390101503,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1433727062066
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.85928376095973,
                        "altitudeAccuracy": 4,
                        "heading": 170.859375,
                        "latitude": -37.90923106953307,
                        "longitude": 145.13234068653094,
                        "speed": 0.9599999785423279
                    },
                    "timestamp": 1433727063082
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.02911091824008,
                        "altitudeAccuracy": 4,
                        "heading": 174.375,
                        "latitude": -37.90923919997915,
                        "longitude": 145.13234102180706,
                        "speed": 0.9900000095367432
                    },
                    "timestamp": 1433727064076
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.07290687913061,
                        "altitudeAccuracy": 4,
                        "heading": 178.59375,
                        "latitude": -37.90924925826295,
                        "longitude": 145.1323397645216,
                        "speed": 1.340000033378601
                    },
                    "timestamp": 1433727065059
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.07124986687104,
                        "altitudeAccuracy": 4,
                        "heading": 182.4609375,
                        "latitude": -37.90926325604125,
                        "longitude": 145.13233833959805,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433727066057
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.95867526568057,
                        "altitudeAccuracy": 4,
                        "heading": 178.59375,
                        "latitude": -37.9092795169334,
                        "longitude": 145.1323376690458,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1433727067060
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.88789567282836,
                        "altitudeAccuracy": 4,
                        "heading": 184.21875,
                        "latitude": -37.90928865320786,
                        "longitude": 145.13233674703645,
                        "speed": 0.4099999964237213
                    },
                    "timestamp": 1433727068060
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.77311850380367,
                        "altitudeAccuracy": 4,
                        "heading": 210.234375,
                        "latitude": -37.909294352902016,
                        "longitude": 145.13233314281808,
                        "speed": 0.6800000071525574
                    },
                    "timestamp": 1433727069074
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.80456805669291,
                        "altitudeAccuracy": 4,
                        "heading": 271.40625,
                        "latitude": -37.909297789482316,
                        "longitude": 145.13232794603812,
                        "speed": 0.44999998807907104
                    },
                    "timestamp": 1433727070075
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.67812998965485,
                        "altitudeAccuracy": 4,
                        "heading": 257.6953125,
                        "latitude": -37.90930105842455,
                        "longitude": 145.13232383890556,
                        "speed": 0.4699999988079071
                    },
                    "timestamp": 1433727071097
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.66717979892861,
                        "altitudeAccuracy": 4,
                        "heading": 215.859375,
                        "latitude": -37.9093117453511,
                        "longitude": 145.1323207376014,
                        "speed": 1.0399999618530273
                    },
                    "timestamp": 1433727072066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.75101007368245,
                        "altitudeAccuracy": 4,
                        "heading": 199.6875,
                        "latitude": -37.90932377338215,
                        "longitude": 145.1323207376014,
                        "speed": 0.3199999928474426
                    },
                    "timestamp": 1433727073072
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.80765189069015,
                        "altitudeAccuracy": 4,
                        "heading": 203.203125,
                        "latitude": -37.90933638814642,
                        "longitude": 145.13232140815364,
                        "speed": 0.8700000047683716
                    },
                    "timestamp": 1433727074073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.9155797646103,
                        "altitudeAccuracy": 4,
                        "heading": 209.8828125,
                        "latitude": -37.90935260712906,
                        "longitude": 145.13232006704914,
                        "speed": 0.9599999785423279
                    },
                    "timestamp": 1433727075087
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.07497242958485,
                        "altitudeAccuracy": 4,
                        "heading": 207.421875,
                        "latitude": -37.90937087967797,
                        "longitude": 145.13231780393528,
                        "speed": 1.059999942779541
                    },
                    "timestamp": 1433727076065
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.05977879051883,
                        "altitudeAccuracy": 4,
                        "heading": 195.8203125,
                        "latitude": -37.90938869122221,
                        "longitude": 145.13231830684947,
                        "speed": 0.9599999785423279
                    },
                    "timestamp": 1433727077076
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.97074277730644,
                        "altitudeAccuracy": 4,
                        "heading": 180.703125,
                        "latitude": -37.909403946285984,
                        "longitude": 145.1323225816201,
                        "speed": 0.7300000190734863
                    },
                    "timestamp": 1433727078078
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.11457523637644,
                        "altitudeAccuracy": 4,
                        "heading": 161.3671875,
                        "latitude": -37.90941664486929,
                        "longitude": 145.1323289518665,
                        "speed": 0.6899999976158142
                    },
                    "timestamp": 1433727079094
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.23410467548226,
                        "altitudeAccuracy": 4,
                        "heading": 142.3828125,
                        "latitude": -37.909425781143746,
                        "longitude": 145.13233548975097,
                        "speed": 0.8600000143051147
                    },
                    "timestamp": 1433727080073
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.06025239943374,
                        "altitudeAccuracy": 4,
                        "heading": 146.25,
                        "latitude": -37.90943583942755,
                        "longitude": 145.13234093798803,
                        "speed": 0.7200000286102295
                    },
                    "timestamp": 1433727081074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.99410313058536,
                        "altitudeAccuracy": 4,
                        "heading": 152.9296875,
                        "latitude": -37.909447238815865,
                        "longitude": 145.13234529657768,
                        "speed": 0.7599999904632568
                    },
                    "timestamp": 1433727082074
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.05962415928934,
                        "altitudeAccuracy": 4,
                        "heading": 165.5859375,
                        "latitude": -37.90946915749266,
                        "longitude": 145.13235216973828,
                        "speed": 1.6100000143051147
                    },
                    "timestamp": 1433727083098
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.17416855037663,
                        "altitudeAccuracy": 4,
                        "heading": 163.125,
                        "latitude": -37.90948554411336,
                        "longitude": 145.13236071927952,
                        "speed": 1.100000023841858
                    },
                    "timestamp": 1433727084075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.41038311903532,
                        "altitudeAccuracy": 4,
                        "heading": 166.2890625,
                        "latitude": -37.90950163736745,
                        "longitude": 145.13236641897367,
                        "speed": 1.1100000143051147
                    },
                    "timestamp": 1433727085068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.67117246397557,
                        "altitudeAccuracy": 4,
                        "heading": 157.1484375,
                        "latitude": -37.90951186328932,
                        "longitude": 145.13237396268653,
                        "speed": 0.3700000047683716
                    },
                    "timestamp": 1433727086071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.99091235967282,
                        "altitudeAccuracy": 4,
                        "heading": 168.046875,
                        "latitude": -37.90952389132037,
                        "longitude": 145.13238066820907,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433727087092
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.0832863702822,
                        "altitudeAccuracy": 3,
                        "heading": 171.5625,
                        "latitude": -37.9095422057788,
                        "longitude": 145.13238611644613,
                        "speed": 1.559999942779541
                    },
                    "timestamp": 1433727088068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.03339956740983,
                        "altitudeAccuracy": 4,
                        "heading": 176.1328125,
                        "latitude": -37.90956060405626,
                        "longitude": 145.1323905588548,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1433727089071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.81009928482054,
                        "altitudeAccuracy": 4,
                        "heading": 175.078125,
                        "latitude": -37.90957648776277,
                        "longitude": 145.1323934087019,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1433727090071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.74903082613213,
                        "altitudeAccuracy": 4,
                        "heading": 181.0546875,
                        "latitude": -37.90959308393105,
                        "longitude": 145.13239357633995,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1433727091094
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.67694496166429,
                        "altitudeAccuracy": 4,
                        "heading": 192.65625,
                        "latitude": -37.90961089547529,
                        "longitude": 145.13238938538836,
                        "speed": 1.5800000429153442
                    },
                    "timestamp": 1433727092075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.94333324479732,
                        "altitudeAccuracy": 4,
                        "heading": 203.90625,
                        "latitude": -37.90962371978714,
                        "longitude": 145.1323852782558,
                        "speed": 1.0499999523162842
                    },
                    "timestamp": 1433727093067
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.86734586909736,
                        "altitudeAccuracy": 4,
                        "heading": 206.015625,
                        "latitude": -37.9096354963611,
                        "longitude": 145.13237932710456,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1433727094069
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.60109633698552,
                        "altitudeAccuracy": 4,
                        "heading": 188.7890625,
                        "latitude": -37.90964207615509,
                        "longitude": 145.1323799976568,
                        "speed": 0.7099999785423279
                    },
                    "timestamp": 1433727095075
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.35607560300845,
                        "altitudeAccuracy": 4,
                        "heading": 163.828125,
                        "latitude": -37.90964932650133,
                        "longitude": 145.13238519443678,
                        "speed": 1.0099999904632568
                    },
                    "timestamp": 1433727096075
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.25975115225683,
                        "altitudeAccuracy": 4,
                        "heading": 149.765625,
                        "latitude": -37.90966177362754,
                        "longitude": 145.13238988830255,
                        "speed": 1.1100000143051147
                    },
                    "timestamp": 1433727097072
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.16054644074211,
                        "altitudeAccuracy": 4,
                        "heading": 166.640625,
                        "latitude": -37.90967979471936,
                        "longitude": 145.1323926543306,
                        "speed": 1.5499999523162842
                    },
                    "timestamp": 1433727098077
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.15504351306319,
                        "altitudeAccuracy": 6,
                        "heading": 166.640625,
                        "latitude": -37.909698654001495,
                        "longitude": 145.13239935985314,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433727099094
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.16294214657273,
                        "altitudeAccuracy": 4,
                        "heading": 159.9609375,
                        "latitude": -37.909712819417855,
                        "longitude": 145.13240866376566,
                        "speed": 0.8799999952316284
                    },
                    "timestamp": 1433727100061
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.31915519219339,
                        "altitudeAccuracy": 4,
                        "heading": 151.875,
                        "latitude": -37.9097261466439,
                        "longitude": 145.13241821913527,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1433727101048
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.18777386078058,
                        "altitudeAccuracy": 4,
                        "heading": 140.9765625,
                        "latitude": -37.909735660104,
                        "longitude": 145.13243431238936,
                        "speed": 0.4000000059604645
                    },
                    "timestamp": 1433727102051
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.3581890448004,
                        "altitudeAccuracy": 4,
                        "heading": 143.0859375,
                        "latitude": -37.909741862712345,
                        "longitude": 145.13244646614896,
                        "speed": 0.20999999344348907
                    },
                    "timestamp": 1433727103051
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.4303740457863,
                        "altitudeAccuracy": 4,
                        "heading": 94.5703125,
                        "latitude": -37.9097475624065,
                        "longitude": 145.13245811699437,
                        "speed": 0.33000001311302185
                    },
                    "timestamp": 1433727104046
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.62601392748282,
                        "altitudeAccuracy": 4,
                        "heading": 136.7578125,
                        "latitude": -37.90975858460917,
                        "longitude": 145.13246775618302,
                        "speed": 0.6800000071525574
                    },
                    "timestamp": 1433727105063
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.48920632383226,
                        "altitudeAccuracy": 4,
                        "heading": 218.671875,
                        "latitude": -37.90977476168229,
                        "longitude": 145.13246247558402,
                        "speed": 1.25
                    },
                    "timestamp": 1433727106077
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.51563813296293,
                        "altitudeAccuracy": 4,
                        "heading": 224.296875,
                        "latitude": -37.90979181885525,
                        "longitude": 145.13245015418636,
                        "speed": 0.7200000286102295
                    },
                    "timestamp": 1433727107078
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.38634201883262,
                        "altitudeAccuracy": 4,
                        "heading": 218.3203125,
                        "latitude": -37.90981088768496,
                        "longitude": 145.13244344866382,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433727108048
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.48499680905415,
                        "altitudeAccuracy": 4,
                        "heading": 144.84375,
                        "latitude": -37.909833937918684,
                        "longitude": 145.13245618915664,
                        "speed": 2.4200000762939453
                    },
                    "timestamp": 1433727109046
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.72146494511723,
                        "altitudeAccuracy": 4,
                        "heading": 128.3203125,
                        "latitude": -37.90985694624289,
                        "longitude": 145.13247990994262,
                        "speed": 2.3399999141693115
                    },
                    "timestamp": 1433727110061
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.51729414799809,
                        "altitudeAccuracy": 4,
                        "heading": 124.1015625,
                        "latitude": -37.90987559597745,
                        "longitude": 145.1325036307286,
                        "speed": 1.7699999809265137
                    },
                    "timestamp": 1433727111074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.93442095726579,
                        "altitudeAccuracy": 4,
                        "heading": 130.078125,
                        "latitude": -37.90988728873237,
                        "longitude": 145.13251813142108,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1433727112080
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.08761785937168,
                        "altitudeAccuracy": 3,
                        "heading": 130.4296875,
                        "latitude": -37.90989717937811,
                        "longitude": 145.1325295308094,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433727113076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.1363787659712,
                        "altitudeAccuracy": 3,
                        "heading": 119.1796875,
                        "latitude": -37.909905351733705,
                        "longitude": 145.1325462107967,
                        "speed": 1.6100000143051147
                    },
                    "timestamp": 1433727114078
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.04717577519736,
                        "altitudeAccuracy": 3,
                        "heading": 94.21875,
                        "latitude": -37.9099098360519,
                        "longitude": 145.13256691409754,
                        "speed": 1.850000023841858
                    },
                    "timestamp": 1433727115078
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.6978288944996,
                        "altitudeAccuracy": 3,
                        "heading": 94.5703125,
                        "latitude": -37.909911135246894,
                        "longitude": 145.1325884555887,
                        "speed": 1.5800000429153442
                    },
                    "timestamp": 1433727116045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.59714560886067,
                        "altitudeAccuracy": 3,
                        "heading": 94.5703125,
                        "latitude": -37.909912141075274,
                        "longitude": 145.1326003578912,
                        "speed": 0.7699999809265137
                    },
                    "timestamp": 1433727117060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.83232928336761,
                        "altitudeAccuracy": 3,
                        "heading": 94.5703125,
                        "latitude": -37.90991276971801,
                        "longitude": 145.1326085721563,
                        "speed": 0.8700000047683716
                    },
                    "timestamp": 1433727118077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.83886072399031,
                        "altitudeAccuracy": 3,
                        "heading": 94.5703125,
                        "latitude": -37.9099135240893,
                        "longitude": 145.13262089355396,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1433727119070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.63564459193506,
                        "altitudeAccuracy": 4,
                        "heading": 96.6796875,
                        "latitude": -37.90991297926559,
                        "longitude": 145.1326389984648,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1433727120068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.54208701380233,
                        "altitudeAccuracy": 4,
                        "heading": 91.7578125,
                        "latitude": -37.90990836921885,
                        "longitude": 145.1326601208608,
                        "speed": 1.4299999475479126
                    },
                    "timestamp": 1433727121072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.78192868169937,
                        "altitudeAccuracy": 4,
                        "heading": 101.25,
                        "latitude": -37.909904639271936,
                        "longitude": 145.13267998597132,
                        "speed": 1.4900000095367432
                    },
                    "timestamp": 1433727122072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.06046940551495,
                        "altitudeAccuracy": 4,
                        "heading": 101.25,
                        "latitude": -37.90990287907227,
                        "longitude": 145.13269943198668,
                        "speed": 1.649999976158142
                    },
                    "timestamp": 1433727123087
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.10342160714934,
                        "altitudeAccuracy": 4,
                        "heading": 103.0078125,
                        "latitude": -37.90990128651067,
                        "longitude": 145.1327177045356,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1433727124082
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.88780890525337,
                        "altitudeAccuracy": 4,
                        "heading": 103.359375,
                        "latitude": -37.90990103505357,
                        "longitude": 145.13273530653225,
                        "speed": 1.6799999475479126
                    },
                    "timestamp": 1433727125074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.73553306135491,
                        "altitudeAccuracy": 4,
                        "heading": 103.0078125,
                        "latitude": -37.909902627615175,
                        "longitude": 145.13275357908117,
                        "speed": 1.5
                    },
                    "timestamp": 1433727126075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.53377347380605,
                        "altitudeAccuracy": 4,
                        "heading": 103.0078125,
                        "latitude": -37.909904345905325,
                        "longitude": 145.1327705943446,
                        "speed": 1.5399999618530273
                    },
                    "timestamp": 1433727127094
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.31128612766129,
                        "altitudeAccuracy": 3,
                        "heading": 94.21875,
                        "latitude": -37.90990539364322,
                        "longitude": 145.1327877772461,
                        "speed": 1.6100000143051147
                    },
                    "timestamp": 1433727128075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.34418495918945,
                        "altitudeAccuracy": 4,
                        "heading": 93.8671875,
                        "latitude": -37.90990489072903,
                        "longitude": 145.1328065527092,
                        "speed": 1.7100000381469727
                    },
                    "timestamp": 1433727129076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.28031416541519,
                        "altitudeAccuracy": 4,
                        "heading": 104.4140625,
                        "latitude": -37.909904052538714,
                        "longitude": 145.13282465762006,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1433727130077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.88953531193563,
                        "altitudeAccuracy": 4,
                        "heading": 105.8203125,
                        "latitude": -37.909905351733705,
                        "longitude": 145.13283815248417,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1433727131077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.00324304271602,
                        "altitudeAccuracy": 4,
                        "heading": 105.46875,
                        "latitude": -37.9099082434903,
                        "longitude": 145.1328538266431,
                        "speed": 1.559999942779541
                    },
                    "timestamp": 1433727132076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.90022540760879,
                        "altitudeAccuracy": 4,
                        "heading": 105.46875,
                        "latitude": -37.909911428613505,
                        "longitude": 145.1328728535633,
                        "speed": 1.7000000476837158
                    },
                    "timestamp": 1433727133072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.93417328745142,
                        "altitudeAccuracy": 4,
                        "heading": 105.1171875,
                        "latitude": -37.90991260207995,
                        "longitude": 145.13289020410286,
                        "speed": 1.2799999713897705
                    },
                    "timestamp": 1433727134077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.91562302594983,
                        "altitudeAccuracy": 4,
                        "heading": 105.46875,
                        "latitude": -37.90991239253237,
                        "longitude": 145.13290545916664,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1433727135094
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.91562302594983,
                        "altitudeAccuracy": 4,
                        "heading": 105.1171875,
                        "latitude": -37.909911721980116,
                        "longitude": 145.13292205533492,
                        "speed": 1.3899999856948853
                    },
                    "timestamp": 1433727136079
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.12785441894108,
                        "altitudeAccuracy": 4,
                        "heading": 105.1171875,
                        "latitude": -37.90991130288496,
                        "longitude": 145.13293873532223,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1433727137078
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.13806556432266,
                        "altitudeAccuracy": 4,
                        "heading": 96.6796875,
                        "latitude": -37.90991151243254,
                        "longitude": 145.13295684023308,
                        "speed": 1.5299999713897705
                    },
                    "timestamp": 1433727138078
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.0237360087012,
                        "altitudeAccuracy": 4,
                        "heading": 105.1171875,
                        "latitude": -37.90991134479447,
                        "longitude": 145.13297494514393,
                        "speed": 1.309999942779541
                    },
                    "timestamp": 1433727139089
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.95539889188258,
                        "altitudeAccuracy": 4,
                        "heading": 105.1171875,
                        "latitude": -37.90990987796142,
                        "longitude": 145.13299464261638,
                        "speed": 1.5199999809265137
                    },
                    "timestamp": 1433727140063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.06566637639156,
                        "altitudeAccuracy": 4,
                        "heading": 93.1640625,
                        "latitude": -37.909909794142386,
                        "longitude": 145.13301920159267,
                        "speed": 1.7999999523162842
                    },
                    "timestamp": 1433727141082
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.44904261336559,
                        "altitudeAccuracy": 4,
                        "heading": 98.7890625,
                        "latitude": -37.909911135246894,
                        "longitude": 145.13303998871254,
                        "speed": 1.3899999856948853
                    },
                    "timestamp": 1433727142077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.50594928508062,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.90991469755574,
                        "longitude": 145.13306010528015,
                        "speed": 1.3899999856948853
                    },
                    "timestamp": 1433727143073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.607286318105,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.90991834368362,
                        "longitude": 145.133078210191,
                        "speed": 1.2300000190734863
                    },
                    "timestamp": 1433727144074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.64519735691958,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.90992169644489,
                        "longitude": 145.13309690183507,
                        "speed": 1.5
                    },
                    "timestamp": 1433727145076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.72761628842801,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.909925174934706,
                        "longitude": 145.1331123245369,
                        "speed": 0.9800000190734863
                    },
                    "timestamp": 1433727146074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.77957562430588,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.9099315032716,
                        "longitude": 145.13312933980035,
                        "speed": 1.5299999713897705
                    },
                    "timestamp": 1433727147092
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.99264166703912,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.90993795733704,
                        "longitude": 145.13314434340703,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1433727148074
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.86477580668551,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.909943196026525,
                        "longitude": 145.13315599425243,
                        "speed": 1
                    },
                    "timestamp": 1433727149067
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.7409854031108,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.90994801562085,
                        "longitude": 145.1331659687172,
                        "speed": 0.8899999856948853
                    },
                    "timestamp": 1433727150069
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.6937519762776,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.90995530787661,
                        "longitude": 145.13316504670786,
                        "speed": 1.1399999856948853
                    },
                    "timestamp": 1433727151073
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.68548419248708,
                        "altitudeAccuracy": 4,
                        "heading": 98.4375,
                        "latitude": -37.90996511470332,
                        "longitude": 145.13315473696696,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1433727152066
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.65796059578801,
                        "altitudeAccuracy": 4,
                        "heading": 228.1640625,
                        "latitude": -37.90997714273437,
                        "longitude": 145.13313780552255,
                        "speed": 1.3899999856948853
                    },
                    "timestamp": 1433727153068
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.46846427294888,
                        "altitudeAccuracy": 4,
                        "heading": 220.4296875,
                        "latitude": -37.90999403226926,
                        "longitude": 145.13313453658031,
                        "speed": 0.8500000238418579
                    },
                    "timestamp": 1433727154070
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.59825089986852,
                        "altitudeAccuracy": 4,
                        "heading": 98.7890625,
                        "latitude": -37.91000484492435,
                        "longitude": 145.13313654823708,
                        "speed": 0.30000001192092896
                    },
                    "timestamp": 1433727155070
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.4297844179706,
                        "altitudeAccuracy": 4,
                        "heading": 98.7890625,
                        "latitude": -37.91001536421283,
                        "longitude": 145.13314275084542,
                        "speed": 0.3100000023841858
                    },
                    "timestamp": 1433727156073
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.47483016595517,
                        "altitudeAccuracy": 4,
                        "heading": 133.59375,
                        "latitude": -37.91002600922986,
                        "longitude": 145.13315339586245,
                        "speed": 0.550000011920929
                    },
                    "timestamp": 1433727157071
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.37804492963433,
                        "altitudeAccuracy": 6,
                        "heading": 109.3359375,
                        "latitude": -37.91003342721417,
                        "longitude": 145.13316663926946,
                        "speed": 0.7300000190734863
                    },
                    "timestamp": 1433727158069
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.35624780727316,
                        "altitudeAccuracy": 6,
                        "heading": 104.4140625,
                        "latitude": -37.91004109665557,
                        "longitude": 145.13318692347514,
                        "speed": 0.9399999976158142
                    },
                    "timestamp": 1433727159073
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.25746443989978,
                        "altitudeAccuracy": 6,
                        "heading": 108.28125,
                        "latitude": -37.91004809554472,
                        "longitude": 145.13320687240468,
                        "speed": 0.9100000262260437
                    },
                    "timestamp": 1433727160077
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.21960489354292,
                        "altitudeAccuracy": 6,
                        "heading": 107.2265625,
                        "latitude": -37.910057022271594,
                        "longitude": 145.13322422294425,
                        "speed": 0.6499999761581421
                    },
                    "timestamp": 1433727161074
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.17531258287914,
                        "altitudeAccuracy": 6,
                        "heading": 117.7734375,
                        "latitude": -37.91006636809363,
                        "longitude": 145.13323972946512,
                        "speed": 0.5199999809265137
                    },
                    "timestamp": 1433727162074
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.2192018158806,
                        "altitudeAccuracy": 6,
                        "heading": 98.7890625,
                        "latitude": -37.91006636809363,
                        "longitude": 145.13323972946512,
                        "speed": 0
                    },
                    "timestamp": 1433727163087
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.09926460356986,
                        "altitudeAccuracy": 6,
                        "heading": 188.0859375,
                        "latitude": -37.91008631702318,
                        "longitude": 145.13326101949917,
                        "speed": 0.44999998807907104
                    },
                    "timestamp": 1433727164078
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.03293190533796,
                        "altitudeAccuracy": 6,
                        "heading": 225.703125,
                        "latitude": -37.910103248467586,
                        "longitude": 145.1332597622137,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1433727165058
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.82620134705951,
                        "altitudeAccuracy": 6,
                        "heading": 223.59375,
                        "latitude": -37.91012403558745,
                        "longitude": 145.13325406251954,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433727166045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.10887472793675,
                        "altitudeAccuracy": 6,
                        "heading": 223.9453125,
                        "latitude": -37.9101405479367,
                        "longitude": 145.1332544816147,
                        "speed": 0.23000000417232513
                    },
                    "timestamp": 1433727167045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.33099057433499,
                        "altitudeAccuracy": 6,
                        "heading": 223.59375,
                        "latitude": -37.91015123486324,
                        "longitude": 145.1332565770905,
                        "speed": 0.23000000417232513
                    },
                    "timestamp": 1433727168047
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.17548515705457,
                        "altitudeAccuracy": 6,
                        "heading": 223.59375,
                        "latitude": -37.91015123486324,
                        "longitude": 145.1332565770905,
                        "speed": 0
                    },
                    "timestamp": 1433727169060
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 96.99498024001599,
                        "altitudeAccuracy": 6,
                        "heading": 223.2421875,
                        "latitude": -37.91017055515005,
                        "longitude": 145.13325967839467,
                        "speed": 0.27000001072883606
                    },
                    "timestamp": 1433727170078
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.2248983293049,
                        "altitudeAccuracy": 6,
                        "heading": 222.890625,
                        "latitude": -37.91018949825122,
                        "longitude": 145.13326219296562,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1433727171078
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 97.30449670154859,
                        "altitudeAccuracy": 4,
                        "heading": 222.890625,
                        "latitude": -37.91021053682818,
                        "longitude": 145.133265881003,
                        "speed": 0.8199999928474426
                    },
                    "timestamp": 1433727172077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.13114379355315,
                        "altitudeAccuracy": 4,
                        "heading": 185.9765625,
                        "latitude": -37.910234173795125,
                        "longitude": 145.13326705446946,
                        "speed": 1.3899999856948853
                    },
                    "timestamp": 1433727173058
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.94954718223511,
                        "altitudeAccuracy": 4,
                        "heading": 196.875,
                        "latitude": -37.910259068047544,
                        "longitude": 145.13326604864108,
                        "speed": 1.4900000095367432
                    },
                    "timestamp": 1433727174059
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.88738589491074,
                        "altitudeAccuracy": 4,
                        "heading": 197.2265625,
                        "latitude": -37.91028245355739,
                        "longitude": 145.1332629473369,
                        "speed": 1.649999976158142
                    },
                    "timestamp": 1433727175063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.09734378250116,
                        "altitudeAccuracy": 4,
                        "heading": 197.2265625,
                        "latitude": -37.91030516851499,
                        "longitude": 145.13325691236662,
                        "speed": 1.5299999713897705
                    },
                    "timestamp": 1433727176067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.0859712843798,
                        "altitudeAccuracy": 4,
                        "heading": 225,
                        "latitude": -37.910322309506974,
                        "longitude": 145.13324978774892,
                        "speed": 0.9599999785423279
                    },
                    "timestamp": 1433727177076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.24445470726506,
                        "altitudeAccuracy": 4,
                        "heading": 232.734375,
                        "latitude": -37.9103363911043,
                        "longitude": 145.13324148966478,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1433727178060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.17352991083173,
                        "altitudeAccuracy": 4,
                        "heading": 232.734375,
                        "latitude": -37.91034582074537,
                        "longitude": 145.1332343650471,
                        "speed": 0.44999998807907104
                    },
                    "timestamp": 1433727179046
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.13451318944792,
                        "altitudeAccuracy": 4,
                        "heading": 233.0859375,
                        "latitude": -37.91035147853001,
                        "longitude": 145.13322941972422,
                        "speed": 0.5
                    },
                    "timestamp": 1433727180047
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.36833939717623,
                        "altitudeAccuracy": 4,
                        "heading": 232.734375,
                        "latitude": -37.910358016414484,
                        "longitude": 145.13322774334358,
                        "speed": 0.5299999713897705
                    },
                    "timestamp": 1433727181046
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.45050167077298,
                        "altitudeAccuracy": 4,
                        "heading": 232.734375,
                        "latitude": -37.91036765560313,
                        "longitude": 145.13322581550585,
                        "speed": 0.8199999928474426
                    },
                    "timestamp": 1433727182047
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.55568317420808,
                        "altitudeAccuracy": 4,
                        "heading": 232.734375,
                        "latitude": -37.91037566032066,
                        "longitude": 145.13322372003006,
                        "speed": 0.36000001430511475
                    },
                    "timestamp": 1433727183051
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.80457413558516,
                        "altitudeAccuracy": 4,
                        "heading": 232.734375,
                        "latitude": -37.91038039609595,
                        "longitude": 145.13322288183974,
                        "speed": 0.28999999165534973
                    },
                    "timestamp": 1433727184051
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.68763872904955,
                        "altitudeAccuracy": 4,
                        "heading": 232.734375,
                        "latitude": -37.910387353075585,
                        "longitude": 145.1332201158117,
                        "speed": 0.550000011920929
                    },
                    "timestamp": 1433727185060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.85506687050061,
                        "altitudeAccuracy": 4,
                        "heading": 232.3828125,
                        "latitude": -37.91039900392099,
                        "longitude": 145.13321634395527,
                        "speed": 0.9700000286102295
                    },
                    "timestamp": 1433727186074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.72902421872165,
                        "altitudeAccuracy": 4,
                        "heading": 232.03125,
                        "latitude": -37.91041442662283,
                        "longitude": 145.13321014134692,
                        "speed": 1.0099999904632568
                    },
                    "timestamp": 1433727187073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.74836305320804,
                        "altitudeAccuracy": 4,
                        "heading": 187.734375,
                        "latitude": -37.91043131615772,
                        "longitude": 145.13320310054826,
                        "speed": 1.399999976158142
                    },
                    "timestamp": 1433727188073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.72950416287087,
                        "altitudeAccuracy": 4,
                        "heading": 172.96875,
                        "latitude": -37.910449379159054,
                        "longitude": 145.1331987419586,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1433727189059
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.66777400895883,
                        "altitudeAccuracy": 4,
                        "heading": 172.265625,
                        "latitude": -37.910464047489604,
                        "longitude": 145.1331968979399,
                        "speed": 1.059999942779541
                    },
                    "timestamp": 1433727190060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.59091375973287,
                        "altitudeAccuracy": 4,
                        "heading": 172.6171875,
                        "latitude": -37.91047682989194,
                        "longitude": 145.133197149397,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433727191077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.03950781805877,
                        "altitudeAccuracy": 4,
                        "heading": 171.9140625,
                        "latitude": -37.910492168774745,
                        "longitude": 145.13320410637664,
                        "speed": 1.649999976158142
                    },
                    "timestamp": 1433727192074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.08660309806949,
                        "altitudeAccuracy": 4,
                        "heading": 172.265625,
                        "latitude": -37.910504112986764,
                        "longitude": 145.1332119015466,
                        "speed": 0.9700000286102295
                    },
                    "timestamp": 1433727193074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.99794761438355,
                        "altitudeAccuracy": 4,
                        "heading": 171.9140625,
                        "latitude": -37.91051329117074,
                        "longitude": 145.13322128927814,
                        "speed": 1.2300000190734863
                    },
                    "timestamp": 1433727194075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.04131204748018,
                        "altitudeAccuracy": 4,
                        "heading": 171.5625,
                        "latitude": -37.91052234362616,
                        "longitude": 145.13323402977096,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1433727195075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.03425680340786,
                        "altitudeAccuracy": 4,
                        "heading": 136.0546875,
                        "latitude": -37.91053215045287,
                        "longitude": 145.13324836282538,
                        "speed": 1.5
                    },
                    "timestamp": 1433727196075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.07078184477916,
                        "altitudeAccuracy": 4,
                        "heading": 167.34375,
                        "latitude": -37.91054338220312,
                        "longitude": 145.1332590078424,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1433727197071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.20333357313343,
                        "altitudeAccuracy": 4,
                        "heading": 166.9921875,
                        "latitude": -37.910552560387096,
                        "longitude": 145.13326755738365,
                        "speed": 0.7200000286102295
                    },
                    "timestamp": 1433727198072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.09667090257922,
                        "altitudeAccuracy": 4,
                        "heading": 166.9921875,
                        "latitude": -37.91056245103284,
                        "longitude": 145.13327225124942,
                        "speed": 0.8600000143051147
                    },
                    "timestamp": 1433727199090
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.34399181513454,
                        "altitudeAccuracy": 4,
                        "heading": 187.3828125,
                        "latitude": -37.91057703554436,
                        "longitude": 145.13327468200134,
                        "speed": 1.2799999713897705
                    },
                    "timestamp": 1433727200071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.0956666577304,
                        "altitudeAccuracy": 4,
                        "heading": 187.03125,
                        "latitude": -37.910591913422486,
                        "longitude": 145.1332771965723,
                        "speed": 0.9399999976158142
                    },
                    "timestamp": 1433727201072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.0266558598502,
                        "altitudeAccuracy": 4,
                        "heading": 187.03125,
                        "latitude": -37.910602139344356,
                        "longitude": 145.13327895677196,
                        "speed": 1.0399999618530273
                    },
                    "timestamp": 1433727202076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.0781901833206,
                        "altitudeAccuracy": 4,
                        "heading": 185.9765625,
                        "latitude": -37.910616598127326,
                        "longitude": 145.1332814713429,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1433727203084
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.12291321144731,
                        "altitudeAccuracy": 4,
                        "heading": 185.625,
                        "latitude": -37.91063365530028,
                        "longitude": 145.13328432119,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1433727204061
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.06089313467608,
                        "altitudeAccuracy": 4,
                        "heading": 193.0078125,
                        "latitude": -37.91065113156839,
                        "longitude": 145.13328557847547,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1433727205071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 96.98085731999382,
                        "altitudeAccuracy": 4,
                        "heading": 191.953125,
                        "latitude": -37.910667895374736,
                        "longitude": 145.1332875063132,
                        "speed": 1.340000033378601
                    },
                    "timestamp": 1433727206076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.09600691998055,
                        "altitudeAccuracy": 4,
                        "heading": 192.65625,
                        "latitude": -37.910686712747356,
                        "longitude": 145.13328759013223,
                        "speed": 1.7599999904632568
                    },
                    "timestamp": 1433727207091
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.22371063638903,
                        "altitudeAccuracy": 4,
                        "heading": 182.8125,
                        "latitude": -37.91070410519644,
                        "longitude": 145.1332890988748,
                        "speed": 1.340000033378601
                    },
                    "timestamp": 1433727208073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.15957110395699,
                        "altitudeAccuracy": 4,
                        "heading": 175.78125,
                        "latitude": -37.91072003081246,
                        "longitude": 145.13329211635994,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433727209075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.56649583565552,
                        "altitudeAccuracy": 4,
                        "heading": 178.2421875,
                        "latitude": -37.91073516014769,
                        "longitude": 145.1332964749496,
                        "speed": 1.100000023841858
                    },
                    "timestamp": 1433727210073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.46946345735581,
                        "altitudeAccuracy": 4,
                        "heading": 177.890625,
                        "latitude": -37.910749744659206,
                        "longitude": 145.13330133645343,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433727211085
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.57337925406065,
                        "altitudeAccuracy": 4,
                        "heading": 177.890625,
                        "latitude": -37.91076395198508,
                        "longitude": 145.1333060303192,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1433727212074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.53181645493628,
                        "altitudeAccuracy": 4,
                        "heading": 177.890625,
                        "latitude": -37.91077782403483,
                        "longitude": 145.13330938308047,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433727213074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.60962693487275,
                        "altitudeAccuracy": 4,
                        "heading": 177.890625,
                        "latitude": -37.910791654175064,
                        "longitude": 145.13331139473723,
                        "speed": 1.190000057220459
                    },
                    "timestamp": 1433727214073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.52873291553887,
                        "altitudeAccuracy": 4,
                        "heading": 178.2421875,
                        "latitude": -37.910808250343344,
                        "longitude": 145.13331038890885,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1433727215089
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.41129563906861,
                        "altitudeAccuracy": 4,
                        "heading": 185.2734375,
                        "latitude": -37.910825642792425,
                        "longitude": 145.13330896398531,
                        "speed": 1.649999976158142
                    },
                    "timestamp": 1433727216071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.43482661213864,
                        "altitudeAccuracy": 4,
                        "heading": 182.4609375,
                        "latitude": -37.91084378961279,
                        "longitude": 145.13330703614758,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1433727217072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.44661706256537,
                        "altitudeAccuracy": 4,
                        "heading": 182.8125,
                        "latitude": -37.91086143351897,
                        "longitude": 145.13330485685276,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433727218073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.52507996267211,
                        "altitudeAccuracy": 4,
                        "heading": 187.03125,
                        "latitude": -37.9108797479774,
                        "longitude": 145.13330267755794,
                        "speed": 1.6100000143051147
                    },
                    "timestamp": 1433727219093
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.6343274612924,
                        "altitudeAccuracy": 3,
                        "heading": 186.6796875,
                        "latitude": -37.91089978072598,
                        "longitude": 145.13330066590117,
                        "speed": 1.7000000476837158
                    },
                    "timestamp": 1433727220071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.14436793918176,
                        "altitudeAccuracy": 3,
                        "heading": 188.4375,
                        "latitude": -37.91092027447923,
                        "longitude": 145.13329697786378,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1433727221069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.47189221577193,
                        "altitudeAccuracy": 3,
                        "heading": 184.5703125,
                        "latitude": -37.910939469037494,
                        "longitude": 145.13329328982638,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433727222072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.76314327048703,
                        "altitudeAccuracy": 3,
                        "heading": 181.7578125,
                        "latitude": -37.910959501786074,
                        "longitude": 145.1332893503319,
                        "speed": 1.75
                    },
                    "timestamp": 1433727223070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.19078356644798,
                        "altitudeAccuracy": 3,
                        "heading": 183.8671875,
                        "latitude": -37.91097848679676,
                        "longitude": 145.1332851593803,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1433727224073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.31166877706487,
                        "altitudeAccuracy": 3,
                        "heading": 183.8671875,
                        "latitude": -37.91099512487455,
                        "longitude": 145.13328138752388,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1433727225071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.48057340296116,
                        "altitudeAccuracy": 3,
                        "heading": 183.8671875,
                        "latitude": -37.91101167913332,
                        "longitude": 145.13327753184842,
                        "speed": 1.6299999952316284
                    },
                    "timestamp": 1433727226073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.51256707438206,
                        "altitudeAccuracy": 3,
                        "heading": 183.8671875,
                        "latitude": -37.91102861057772,
                        "longitude": 145.13327233506845,
                        "speed": 1.7200000286102295
                    },
                    "timestamp": 1433727227087
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.51256707438206,
                        "altitudeAccuracy": 3,
                        "heading": 197.578125,
                        "latitude": -37.911045290565035,
                        "longitude": 145.13326562954592,
                        "speed": 1.690000057220459
                    },
                    "timestamp": 1433727228072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.38979530694542,
                        "altitudeAccuracy": 3,
                        "heading": 190.1953125,
                        "latitude": -37.91106222200944,
                        "longitude": 145.1332590078424,
                        "speed": 1.7999999523162842
                    },
                    "timestamp": 1433727229071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.22794953187164,
                        "altitudeAccuracy": 3,
                        "heading": 194.4140625,
                        "latitude": -37.91107839908256,
                        "longitude": 145.13325246995794,
                        "speed": 1.6200000047683716
                    },
                    "timestamp": 1433727230072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.2074716063227,
                        "altitudeAccuracy": 3,
                        "heading": 185.9765625,
                        "latitude": -37.91109570771261,
                        "longitude": 145.13324702172088,
                        "speed": 1.840000033378601
                    },
                    "timestamp": 1433727231072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.16409822455759,
                        "altitudeAccuracy": 3,
                        "heading": 191.25,
                        "latitude": -37.911112764885566,
                        "longitude": 145.1332418249409,
                        "speed": 1.6299999952316284
                    },
                    "timestamp": 1433727232071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.23093369167162,
                        "altitudeAccuracy": 3,
                        "heading": 196.5234375,
                        "latitude": -37.91112789422079,
                        "longitude": 145.13323687961804,
                        "speed": 1.5399999618530273
                    },
                    "timestamp": 1433727233072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.23593034848668,
                        "altitudeAccuracy": 3,
                        "heading": 196.171875,
                        "latitude": -37.9111421853657,
                        "longitude": 145.13323193429517,
                        "speed": 1.5499999523162842
                    },
                    "timestamp": 1433727234075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.29687694534827,
                        "altitudeAccuracy": 3,
                        "heading": 198.28125,
                        "latitude": -37.91115538686319,
                        "longitude": 145.1332274918865,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1433727235081
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.20968067177617,
                        "altitudeAccuracy": 3,
                        "heading": 190.546875,
                        "latitude": -37.91116733107521,
                        "longitude": 145.13322397148715,
                        "speed": 1.309999942779541
                    },
                    "timestamp": 1433727236060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.24414244034647,
                        "altitudeAccuracy": 3,
                        "heading": 190.1953125,
                        "latitude": -37.91117889810159,
                        "longitude": 145.133220954002,
                        "speed": 1.25
                    },
                    "timestamp": 1433727237077
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.00850370058947,
                        "altitudeAccuracy": 3,
                        "heading": 190.546875,
                        "latitude": -37.9111913452278,
                        "longitude": 145.13321584104108,
                        "speed": 1.5
                    },
                    "timestamp": 1433727238080
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 99.12818029564535,
                        "altitudeAccuracy": 3,
                        "heading": 218.3203125,
                        "latitude": -37.91120542682513,
                        "longitude": 145.13320704004275,
                        "speed": 1.6200000047683716
                    },
                    "timestamp": 1433727239085
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.79699053648096,
                        "altitudeAccuracy": 3,
                        "heading": 219.0234375,
                        "latitude": -37.91121795777037,
                        "longitude": 145.1331928746264,
                        "speed": 1.7200000286102295
                    },
                    "timestamp": 1433727240083
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.7679272594781,
                        "altitudeAccuracy": 3,
                        "heading": 219.0234375,
                        "latitude": -37.911224663292906,
                        "longitude": 145.13317694901036,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1433727241076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.715748851662,
                        "altitudeAccuracy": 3,
                        "heading": 219.0234375,
                        "latitude": -37.911225878668866,
                        "longitude": 145.13316177776562,
                        "speed": 1.2799999713897705
                    },
                    "timestamp": 1433727242073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.66792395563516,
                        "altitudeAccuracy": 3,
                        "heading": 218.671875,
                        "latitude": -37.91122248399808,
                        "longitude": 145.1331485343586,
                        "speed": 1.190000057220459
                    },
                    "timestamp": 1433727243092
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.6470623229101,
                        "altitudeAccuracy": 3,
                        "heading": 218.671875,
                        "latitude": -37.9112180415894,
                        "longitude": 145.13313797316061,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1433727244073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.51763121659285,
                        "altitudeAccuracy": 3,
                        "heading": 218.671875,
                        "latitude": -37.91121368299975,
                        "longitude": 145.13312774723875,
                        "speed": 0.9399999976158142
                    },
                    "timestamp": 1433727245071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.44291044365158,
                        "altitudeAccuracy": 3,
                        "heading": 290.390625,
                        "latitude": -37.911213431542656,
                        "longitude": 145.13310980996596,
                        "speed": 1.5099999904632568
                    },
                    "timestamp": 1433727246081
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.24746076520701,
                        "altitudeAccuracy": 3,
                        "heading": 250.6640625,
                        "latitude": -37.911216784303924,
                        "longitude": 145.13308541862773,
                        "speed": 1.5299999713897705
                    },
                    "timestamp": 1433727247090
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.09603757842261,
                        "altitudeAccuracy": 3,
                        "heading": 253.125,
                        "latitude": -37.91121934078439,
                        "longitude": 145.1330647153269,
                        "speed": 1.1799999475479126
                    },
                    "timestamp": 1433727248074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.16953356541468,
                        "altitudeAccuracy": 3,
                        "heading": 253.125,
                        "latitude": -37.91122034661277,
                        "longitude": 145.13304468257832,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1433727249075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.944002840088,
                        "altitudeAccuracy": 3,
                        "heading": 242.2265625,
                        "latitude": -37.91122420228823,
                        "longitude": 145.13302263817297,
                        "speed": 1.5299999713897705
                    },
                    "timestamp": 1433727250074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.78157542416695,
                        "altitudeAccuracy": 3,
                        "heading": 243.28125,
                        "latitude": -37.91123061444416,
                        "longitude": 145.13300168341505,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1433727251081
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.69928563400104,
                        "altitudeAccuracy": 3,
                        "heading": 243.28125,
                        "latitude": -37.91123694278105,
                        "longitude": 145.1329838299613,
                        "speed": 1.1399999856948853
                    },
                    "timestamp": 1433727252078
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.04830306043742,
                        "altitudeAccuracy": 3,
                        "heading": 242.9296875,
                        "latitude": -37.911246917245826,
                        "longitude": 145.13296471922206,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433727253080
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.96859236964004,
                        "altitudeAccuracy": 3,
                        "heading": 242.9296875,
                        "latitude": -37.91126011874332,
                        "longitude": 145.13294627903508,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1433727254073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 97.98559598175021,
                        "altitudeAccuracy": 3,
                        "heading": 222.890625,
                        "latitude": -37.91127851702078,
                        "longitude": 145.13292934759068,
                        "speed": 1.7000000476837158
                    },
                    "timestamp": 1433727255091
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.18114079851865,
                        "altitudeAccuracy": 3,
                        "heading": 222.5390625,
                        "latitude": -37.91129787921711,
                        "longitude": 145.13291417634593,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1433727256074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.1583571334363,
                        "altitudeAccuracy": 3,
                        "heading": 221.8359375,
                        "latitude": -37.911316528951666,
                        "longitude": 145.1329069679092,
                        "speed": 1.309999942779541
                    },
                    "timestamp": 1433727257075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.17550124931894,
                        "altitudeAccuracy": 3,
                        "heading": 221.8359375,
                        "latitude": -37.91133471768155,
                        "longitude": 145.13290554298567,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1433727258075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.36319963481725,
                        "altitudeAccuracy": 3,
                        "heading": 174.375,
                        "latitude": -37.91135382842078,
                        "longitude": 145.13290529152857,
                        "speed": 1.6299999952316284
                    },
                    "timestamp": 1433727259083
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.42776993818657,
                        "altitudeAccuracy": 3,
                        "heading": 185.9765625,
                        "latitude": -37.91137465745016,
                        "longitude": 145.13290361514794,
                        "speed": 1.7599999904632568
                    },
                    "timestamp": 1433727260083
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.59926431826159,
                        "altitudeAccuracy": 3,
                        "heading": 221.484375,
                        "latitude": -37.91138794276669,
                        "longitude": 145.1329032798718,
                        "speed": 0.7799999713897705
                    },
                    "timestamp": 1433727261073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.46674228261271,
                        "altitudeAccuracy": 3,
                        "heading": 221.8359375,
                        "latitude": -37.91139720476969,
                        "longitude": 145.1329024416815,
                        "speed": 0.7400000095367432
                    },
                    "timestamp": 1433727262068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.36158759779235,
                        "altitudeAccuracy": 3,
                        "heading": 221.8359375,
                        "latitude": -37.911407598329625,
                        "longitude": 145.13290311223375,
                        "speed": 1.1399999856948853
                    },
                    "timestamp": 1433727263090
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.29773633084864,
                        "altitudeAccuracy": 3,
                        "heading": 184.5703125,
                        "latitude": -37.91142117701276,
                        "longitude": 145.13290126821505,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433727264074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.38681123426524,
                        "altitudeAccuracy": 3,
                        "heading": 194.4140625,
                        "latitude": -37.91143559388622,
                        "longitude": 145.1328964067112,
                        "speed": 1.340000033378601
                    },
                    "timestamp": 1433727265076
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.40806539592198,
                        "altitudeAccuracy": 3,
                        "heading": 221.484375,
                        "latitude": -37.911444520613095,
                        "longitude": 145.13288986882674,
                        "speed": 0.4699999988079071
                    },
                    "timestamp": 1433727266072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.4686703017437,
                        "altitudeAccuracy": 3,
                        "heading": 221.8359375,
                        "latitude": -37.91144879538371,
                        "longitude": 145.1328834147613,
                        "speed": 0.20999999344348907
                    },
                    "timestamp": 1433727267084
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.4301292225608,
                        "altitudeAccuracy": 3,
                        "heading": 221.8359375,
                        "latitude": -37.91145147759273,
                        "longitude": 145.13287687687682,
                        "speed": 0.15000000596046448
                    },
                    "timestamp": 1433727268061
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 98.52611162167393,
                        "altitudeAccuracy": 3,
                        "heading": 221.8359375,
                        "latitude": -37.91145147759273,
                        "longitude": 145.13287687687682,
                        "speed": 0
                    },
                    "timestamp": 1433727269070
                }
            ]
        },
        {
            title: "Simulate: Rainforest Walk loop",
            locations: [
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.8197139627619,
                        "altitudeAccuracy": 4,
                        "heading": 174.7265625,
                        "latitude": -37.91021594315573,
                        "longitude": 145.13183861053093,
                        "speed": 0
                    },
                    "timestamp": 1434063922085
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.8197139627619,
                        "altitudeAccuracy": 4,
                        "heading": 174.7265625,
                        "latitude": -37.91021594315573,
                        "longitude": 145.13183861053093,
                        "speed": 0
                    },
                    "timestamp": 1434063922090
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.77894181956187,
                        "altitudeAccuracy": 4,
                        "heading": 174.7265625,
                        "latitude": -37.91021594315573,
                        "longitude": 145.13183861053093,
                        "speed": 0
                    },
                    "timestamp": 1434063923057
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.88747609829062,
                        "altitudeAccuracy": 4,
                        "heading": 174.7265625,
                        "latitude": -37.91021594315573,
                        "longitude": 145.13183861053093,
                        "speed": 0
                    },
                    "timestamp": 1434063924065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.78522593664754,
                        "altitudeAccuracy": 4,
                        "heading": 174.7265625,
                        "latitude": -37.91021594315573,
                        "longitude": 145.13183861053093,
                        "speed": 0
                    },
                    "timestamp": 1434063925056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.75466743697102,
                        "altitudeAccuracy": 4,
                        "heading": 174.7265625,
                        "latitude": -37.91021594315573,
                        "longitude": 145.13183861053093,
                        "speed": 0
                    },
                    "timestamp": 1434063926074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.73130605246206,
                        "altitudeAccuracy": 4,
                        "heading": 174.7265625,
                        "latitude": -37.91021854154571,
                        "longitude": 145.13179712011024,
                        "speed": 0.5299999713897705
                    },
                    "timestamp": 1434063927053
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.76306163555833,
                        "altitudeAccuracy": 4,
                        "heading": 175.078125,
                        "latitude": -37.910217074712655,
                        "longitude": 145.13178111067518,
                        "speed": 1.5299999713897705
                    },
                    "timestamp": 1434063928041
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.84533789370532,
                        "altitudeAccuracy": 4,
                        "heading": 286.5234375,
                        "latitude": -37.91021523069396,
                        "longitude": 145.1317581442605,
                        "speed": 1.5199999809265137
                    },
                    "timestamp": 1434063929049
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.8586799681581,
                        "altitudeAccuracy": 4,
                        "heading": 284.765625,
                        "latitude": -37.910215356422505,
                        "longitude": 145.13173408819839,
                        "speed": 1.649999976158142
                    },
                    "timestamp": 1434063930063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.86138718105134,
                        "altitudeAccuracy": 4,
                        "heading": 277.3828125,
                        "latitude": -37.91021644606992,
                        "longitude": 145.1317085233937,
                        "speed": 1.75
                    },
                    "timestamp": 1434063931068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.98676865591388,
                        "altitudeAccuracy": 3,
                        "heading": 278.0859375,
                        "latitude": -37.91021694898411,
                        "longitude": 145.13168572461709,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1434063932072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.99312368362469,
                        "altitudeAccuracy": 4,
                        "heading": 277.734375,
                        "latitude": -37.910217787174425,
                        "longitude": 145.1316672844301,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1434063933112
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.85498415024342,
                        "altitudeAccuracy": 3,
                        "heading": 278.0859375,
                        "latitude": -37.91021724235072,
                        "longitude": 145.1316487604241,
                        "speed": 1.3300000429153442
                    },
                    "timestamp": 1434063934067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.90772373749982,
                        "altitudeAccuracy": 3,
                        "heading": 273.1640625,
                        "latitude": -37.91021715853169,
                        "longitude": 145.13162755420908,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1434063935054
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.82261816423514,
                        "altitudeAccuracy": 3,
                        "heading": 273.1640625,
                        "latitude": -37.910217074712655,
                        "longitude": 145.13160718618437,
                        "speed": 1.2899999618530273
                    },
                    "timestamp": 1434063936056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.86822938542221,
                        "altitudeAccuracy": 3,
                        "heading": 281.953125,
                        "latitude": -37.910216278431854,
                        "longitude": 145.13159042237803,
                        "speed": 1.2200000286102295
                    },
                    "timestamp": 1434063937069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.87416659464836,
                        "altitudeAccuracy": 3,
                        "heading": 281.6015625,
                        "latitude": -37.910214141046545,
                        "longitude": 145.13157256892427,
                        "speed": 1.3899999856948853
                    },
                    "timestamp": 1434063938067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.68103091190568,
                        "altitudeAccuracy": 3,
                        "heading": 281.6015625,
                        "latitude": -37.91021208748027,
                        "longitude": 145.1315557212989,
                        "speed": 1.190000057220459
                    },
                    "timestamp": 1434063939056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.78317227214478,
                        "altitudeAccuracy": 3,
                        "heading": 273.515625,
                        "latitude": -37.91020990818544,
                        "longitude": 145.13153845457836,
                        "speed": 1.309999942779541
                    },
                    "timestamp": 1434063940060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.71812734031808,
                        "altitudeAccuracy": 3,
                        "heading": 274.5703125,
                        "latitude": -37.91020701642885,
                        "longitude": 145.1315206011246,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1434063941055
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.61354933855525,
                        "altitudeAccuracy": 3,
                        "heading": 275.9765625,
                        "latitude": -37.91020471140548,
                        "longitude": 145.1315047593276,
                        "speed": 0.8899999856948853
                    },
                    "timestamp": 1434063942039
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.62172059022917,
                        "altitudeAccuracy": 3,
                        "heading": 275.9765625,
                        "latitude": -37.91020249020114,
                        "longitude": 145.13149143210157,
                        "speed": 0.7799999713897705
                    },
                    "timestamp": 1434063943070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.70806489274923,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.910199263168415,
                        "longitude": 145.13147869160875,
                        "speed": 0.8700000047683716
                    },
                    "timestamp": 1434063944042
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.69574503605743,
                        "altitudeAccuracy": 4,
                        "heading": 276.6796875,
                        "latitude": -37.910195826588115,
                        "longitude": 145.13146787895366,
                        "speed": 0.6399999856948853
                    },
                    "timestamp": 1434063945046
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.74509856554,
                        "altitudeAccuracy": 4,
                        "heading": 276.6796875,
                        "latitude": -37.91019456930264,
                        "longitude": 145.13145622810825,
                        "speed": 0.6700000166893005
                    },
                    "timestamp": 1434063946045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.80790040253709,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91019591040715,
                        "longitude": 145.13144432580575,
                        "speed": 0.6399999856948853
                    },
                    "timestamp": 1434063947038
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.85733389591606,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91019595231666,
                        "longitude": 145.13143292641743,
                        "speed": 0.47999998927116394
                    },
                    "timestamp": 1434063948040
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.85733389591606,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.910193814931354,
                        "longitude": 145.13142789727553,
                        "speed": 0.5699999928474426
                    },
                    "timestamp": 1434063949040
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.87227795789646,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91018832478478,
                        "longitude": 145.13142420923813,
                        "speed": 0.8799999952316284
                    },
                    "timestamp": 1434063950038
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.95734295514684,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.910185097752056,
                        "longitude": 145.1314204373817,
                        "speed": 0.46000000834465027
                    },
                    "timestamp": 1434063951045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.98983905529848,
                        "altitudeAccuracy": 4,
                        "heading": 275.9765625,
                        "latitude": -37.91018233172401,
                        "longitude": 145.13141691698237,
                        "speed": 0.8299999833106995
                    },
                    "timestamp": 1434063952055
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.99929529258596,
                        "altitudeAccuracy": 4,
                        "heading": 275.9765625,
                        "latitude": -37.91017839222952,
                        "longitude": 145.13141532442077,
                        "speed": 0.7599999904632568
                    },
                    "timestamp": 1434063953056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.17976854668221,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.9101733211781,
                        "longitude": 145.1314135642211,
                        "speed": 0.7900000214576721
                    },
                    "timestamp": 1434063954037
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.10333212127972,
                        "altitudeAccuracy": 4,
                        "heading": 36.2109375,
                        "latitude": -37.910162131337366,
                        "longitude": 145.13140970854565,
                        "speed": 1.1799999475479126
                    },
                    "timestamp": 1434063955036
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.0283653636688,
                        "altitudeAccuracy": 4,
                        "heading": 16.171875,
                        "latitude": -37.910142517683944,
                        "longitude": 145.13140518231793,
                        "speed": 1.8200000524520874
                    },
                    "timestamp": 1434063956036
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.1350661713829,
                        "altitudeAccuracy": 4,
                        "heading": 13.0078125,
                        "latitude": -37.91012030564054,
                        "longitude": 145.13140174573763,
                        "speed": 1.559999942779541
                    },
                    "timestamp": 1434063957053
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 102.94935749982285,
                        "altitudeAccuracy": 4,
                        "heading": 18.28125,
                        "latitude": -37.910096668673596,
                        "longitude": 145.13140358975633,
                        "speed": 1.8799999952316284
                    },
                    "timestamp": 1434063958053
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 103.16210232629571,
                        "altitudeAccuracy": 4,
                        "heading": 25.6640625,
                        "latitude": -37.910065404174766,
                        "longitude": 145.13141004382177,
                        "speed": 2.5899999141693115
                    },
                    "timestamp": 1434063959038
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 103.0892908945093,
                        "altitudeAccuracy": 4,
                        "heading": 17.9296875,
                        "latitude": -37.91003807917043,
                        "longitude": 145.13141104965015,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1434063960054
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 103.16785395276186,
                        "altitudeAccuracy": 4,
                        "heading": 8.7890625,
                        "latitude": -37.91001398119881,
                        "longitude": 145.1314082836221,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1434063961068
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 103.10882886866634,
                        "altitudeAccuracy": 4,
                        "heading": 11.25,
                        "latitude": -37.909993277897975,
                        "longitude": 145.13140912181242,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1434063962053
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.25110260393423,
                        "altitudeAccuracy": 4,
                        "heading": 43.9453125,
                        "latitude": -37.909977897105655,
                        "longitude": 145.13142496360942,
                        "speed": 1.6399999856948853
                    },
                    "timestamp": 1434063963053
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.23434745729116,
                        "altitudeAccuracy": 4,
                        "heading": 75.234375,
                        "latitude": -37.909970018116674,
                        "longitude": 145.13144558309122,
                        "speed": 1.4299999475479126
                    },
                    "timestamp": 1434063964071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.233013158165,
                        "altitudeAccuracy": 4,
                        "heading": 86.484375,
                        "latitude": -37.9099669168125,
                        "longitude": 145.1314674598585,
                        "speed": 1.6299999952316284
                    },
                    "timestamp": 1434063965070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.34519225596156,
                        "altitudeAccuracy": 4,
                        "heading": 90.703125,
                        "latitude": -37.90996553379848,
                        "longitude": 145.1314936113964,
                        "speed": 1.75
                    },
                    "timestamp": 1434063966052
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.38102682673247,
                        "altitudeAccuracy": 4,
                        "heading": 89.6484375,
                        "latitude": -37.90996385741784,
                        "longitude": 145.13151615871593,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1434063967055
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.16774213499508,
                        "altitudeAccuracy": 4,
                        "heading": 91.0546875,
                        "latitude": -37.90996327068462,
                        "longitude": 145.1315398795019,
                        "speed": 1.4199999570846558
                    },
                    "timestamp": 1434063968067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.12162338904888,
                        "altitudeAccuracy": 4,
                        "heading": 102.65625,
                        "latitude": -37.909969808569095,
                        "longitude": 145.13155882260307,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1434063969070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.11757722286184,
                        "altitudeAccuracy": 4,
                        "heading": 117.0703125,
                        "latitude": -37.909980537405154,
                        "longitude": 145.13157533495232,
                        "speed": 1.5499999523162842
                    },
                    "timestamp": 1434063970067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.16010131118352,
                        "altitudeAccuracy": 4,
                        "heading": 134.6484375,
                        "latitude": -37.90999587628796,
                        "longitude": 145.13158732107385,
                        "speed": 1.399999976158142
                    },
                    "timestamp": 1434063971066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.20420353952746,
                        "altitudeAccuracy": 4,
                        "heading": 155.390625,
                        "latitude": -37.9100163281317,
                        "longitude": 145.13159251785382,
                        "speed": 1.809999942779541
                    },
                    "timestamp": 1434063972068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 103.07567025812533,
                        "altitudeAccuracy": 4,
                        "heading": 170.859375,
                        "latitude": -37.91004034228428,
                        "longitude": 145.13159260167285,
                        "speed": 1.8899999856948853
                    },
                    "timestamp": 1434063973067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.9833938161437,
                        "altitudeAccuracy": 4,
                        "heading": 183.515625,
                        "latitude": -37.9100654879938,
                        "longitude": 145.1315863990645,
                        "speed": 2
                    },
                    "timestamp": 1434063974068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.7027621338867,
                        "altitudeAccuracy": 4,
                        "heading": 193.0078125,
                        "latitude": -37.91008992124154,
                        "longitude": 145.13157365857168,
                        "speed": 1.9700000286102295
                    },
                    "timestamp": 1434063975072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.57867673523832,
                        "altitudeAccuracy": 4,
                        "heading": 197.9296875,
                        "latitude": -37.91011431257977,
                        "longitude": 145.13156016370758,
                        "speed": 2.049999952316284
                    },
                    "timestamp": 1434063976073
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 102.53211740861596,
                        "altitudeAccuracy": 4,
                        "heading": 195.8203125,
                        "latitude": -37.9101352673377,
                        "longitude": 145.13155261999472,
                        "speed": 1.7300000190734863
                    },
                    "timestamp": 1434063977072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.23498793607487,
                        "altitudeAccuracy": 4,
                        "heading": 183.515625,
                        "latitude": -37.91015492290064,
                        "longitude": 145.1315501892428,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1434063978070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.09865835650203,
                        "altitudeAccuracy": 4,
                        "heading": 164.53125,
                        "latitude": -37.91017277635439,
                        "longitude": 145.13155186562344,
                        "speed": 1.6299999952316284
                    },
                    "timestamp": 1434063979070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.12608410830909,
                        "altitudeAccuracy": 4,
                        "heading": 164.1796875,
                        "latitude": -37.910188534332356,
                        "longitude": 145.13155739767953,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1434063980065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.03345864628425,
                        "altitudeAccuracy": 4,
                        "heading": 164.1796875,
                        "latitude": -37.91020496286257,
                        "longitude": 145.1315634326498,
                        "speed": 1.7999999523162842
                    },
                    "timestamp": 1434063981063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.99313817036143,
                        "altitudeAccuracy": 4,
                        "heading": 164.1796875,
                        "latitude": -37.91022147521182,
                        "longitude": 145.13156854561075,
                        "speed": 1.5299999713897705
                    },
                    "timestamp": 1434063982065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.03495761064546,
                        "altitudeAccuracy": 4,
                        "heading": 164.53125,
                        "latitude": -37.910238616203806,
                        "longitude": 145.13157323947652,
                        "speed": 1.7699999809265137
                    },
                    "timestamp": 1434063983065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.13398494818014,
                        "altitudeAccuracy": 4,
                        "heading": 158.5546875,
                        "latitude": -37.91025538001015,
                        "longitude": 145.131579777361,
                        "speed": 1.6200000047683716
                    },
                    "timestamp": 1434063984067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.16690902218258,
                        "altitudeAccuracy": 4,
                        "heading": 159.609375,
                        "latitude": -37.91026904251232,
                        "longitude": 145.13158421976968,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1434063985069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.24118463286086,
                        "altitudeAccuracy": 3,
                        "heading": 167.34375,
                        "latitude": -37.9102814058195,
                        "longitude": 145.13158841072126,
                        "speed": 1.2899999618530273
                    },
                    "timestamp": 1434063986071
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.09164808365712,
                        "altitudeAccuracy": 4,
                        "heading": 167.34375,
                        "latitude": -37.910295487416825,
                        "longitude": 145.13159184730156,
                        "speed": 1.659999966621399
                    },
                    "timestamp": 1434063987075
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.92259662965562,
                        "altitudeAccuracy": 4,
                        "heading": 167.6953125,
                        "latitude": -37.91030977856173,
                        "longitude": 145.13159184730156,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1434063988073
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.85908740551469,
                        "altitudeAccuracy": 3,
                        "heading": 167.6953125,
                        "latitude": -37.910323399154386,
                        "longitude": 145.1315921825777,
                        "speed": 1.5800000429153442
                    },
                    "timestamp": 1434063989063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.95671191551865,
                        "altitudeAccuracy": 3,
                        "heading": 181.0546875,
                        "latitude": -37.91033802557542,
                        "longitude": 145.13159176348253,
                        "speed": 1.5
                    },
                    "timestamp": 1434063990056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.08485668285938,
                        "altitudeAccuracy": 3,
                        "heading": 181.0546875,
                        "latitude": -37.91035126898243,
                        "longitude": 145.1315916796635,
                        "speed": 1.5800000429153442
                    },
                    "timestamp": 1434063991065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 101.97221001799456,
                        "altitudeAccuracy": 3,
                        "heading": 185.9765625,
                        "latitude": -37.910363674199125,
                        "longitude": 145.13159285312994,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1434063992065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.09864072182957,
                        "altitudeAccuracy": 3,
                        "heading": 185.9765625,
                        "latitude": -37.91037536695405,
                        "longitude": 145.13159260167285,
                        "speed": 1.399999976158142
                    },
                    "timestamp": 1434063993063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.12331413856126,
                        "altitudeAccuracy": 3,
                        "heading": 190.8984375,
                        "latitude": -37.91038726925655,
                        "longitude": 145.1315911767493,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1434063994070
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.20585178968935,
                        "altitudeAccuracy": 3,
                        "heading": 190.1953125,
                        "latitude": -37.910399381106636,
                        "longitude": 145.13159000328287,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1434063995068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 102.28612349982379,
                        "altitudeAccuracy": 3,
                        "heading": 190.1953125,
                        "latitude": -37.910410529037854,
                        "longitude": 145.13158857835933,
                        "speed": 1.2200000286102295
                    },
                    "timestamp": 1434063996067
                }
            ]
        },
        {
            title: "Simulate: Hargrave-Andrew pretzel",
            locations: [
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.37407929290927,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.910263217089614,
                        "longitude": 145.13230615308987,
                        "speed": 0
                    },
                    "timestamp": 1433902424407
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.37407929290927,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.910263217089614,
                        "longitude": 145.13230615308987,
                        "speed": 0
                    },
                    "timestamp": 1433902424421
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.38750895683411,
                        "altitudeAccuracy": 8,
                        "heading": 103.0078125,
                        "latitude": -37.910263217089614,
                        "longitude": 145.13230615308987,
                        "speed": 0
                    },
                    "timestamp": 1433902425049
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.21546704783742,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.910263217089614,
                        "longitude": 145.13230615308987,
                        "speed": 0
                    },
                    "timestamp": 1433902426049
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.29159490985917,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.91026363618477,
                        "longitude": 145.13230271650957,
                        "speed": 0.5600000023841858
                    },
                    "timestamp": 1433902427042
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.20381025767296,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.91026204362317,
                        "longitude": 145.13229626244413,
                        "speed": 1.1399999856948853
                    },
                    "timestamp": 1433902428038
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.75257545833358,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.91025433227225,
                        "longitude": 145.13228394104647,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1433902429038
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.77935627458065,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.91025211106791,
                        "longitude": 145.13227463713395,
                        "speed": 0.6000000238418579
                    },
                    "timestamp": 1433902430052
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.72549139781714,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.91025458372935,
                        "longitude": 145.1322665905069,
                        "speed": 0.7900000214576721
                    },
                    "timestamp": 1433902431065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.6298731059247,
                        "altitudeAccuracy": 6,
                        "heading": 103.0078125,
                        "latitude": -37.91025403890564,
                        "longitude": 145.1322551911186,
                        "speed": 0.7099999785423279
                    },
                    "timestamp": 1433902432084
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 94.08687419821004,
                        "altitudeAccuracy": 6,
                        "heading": 308.3203125,
                        "latitude": -37.91024800393536,
                        "longitude": 145.13224362409218,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1433902433065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 94.0832108895156,
                        "altitudeAccuracy": 6,
                        "heading": 348.046875,
                        "latitude": -37.91023673027559,
                        "longitude": 145.13223775675996,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1433902434051
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 94.07020464154998,
                        "altitudeAccuracy": 6,
                        "heading": 15.8203125,
                        "latitude": -37.9102206370215,
                        "longitude": 145.13224295353993,
                        "speed": 2.0299999713897705
                    },
                    "timestamp": 1433902435038
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.96792926812925,
                        "altitudeAccuracy": 6,
                        "heading": 24.2578125,
                        "latitude": -37.91020592678144,
                        "longitude": 145.13225066489088,
                        "speed": 1.4900000095367432
                    },
                    "timestamp": 1433902436053
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.93831438917483,
                        "altitudeAccuracy": 6,
                        "heading": 21.796875,
                        "latitude": -37.91019519794538,
                        "longitude": 145.13225569403278,
                        "speed": 1.1799999475479126
                    },
                    "timestamp": 1433902437060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.93077295995073,
                        "altitudeAccuracy": 6,
                        "heading": 13.359375,
                        "latitude": -37.91018354709997,
                        "longitude": 145.13225686749922,
                        "speed": 1.5800000429153442
                    },
                    "timestamp": 1433902438052
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.83239237287532,
                        "altitudeAccuracy": 6,
                        "heading": 11.953125,
                        "latitude": -37.91017223153069,
                        "longitude": 145.13225619694697,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1433902439067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.58086497203351,
                        "altitudeAccuracy": 6,
                        "heading": 14.765625,
                        "latitude": -37.91016217324688,
                        "longitude": 145.13225720277535,
                        "speed": 1.309999942779541
                    },
                    "timestamp": 1433902440080
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.44267600612032,
                        "altitudeAccuracy": 6,
                        "heading": 22.5,
                        "latitude": -37.910154042800805,
                        "longitude": 145.1322610584508,
                        "speed": 1.190000057220459
                    },
                    "timestamp": 1433902441064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.2923099694404,
                        "altitudeAccuracy": 6,
                        "heading": 18.28125,
                        "latitude": -37.910145744716665,
                        "longitude": 145.13226558467852,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1433902442064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.11397364426384,
                        "altitudeAccuracy": 8,
                        "heading": 19.6875,
                        "latitude": -37.91013862009897,
                        "longitude": 145.13226876980173,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1433902443048
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.1852761588733,
                        "altitudeAccuracy": 8,
                        "heading": 19.3359375,
                        "latitude": -37.910131369752726,
                        "longitude": 145.13227061382042,
                        "speed": 1.2200000286102295
                    },
                    "timestamp": 1433902444038
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.14493070385728,
                        "altitudeAccuracy": 8,
                        "heading": 19.3359375,
                        "latitude": -37.91012240111633,
                        "longitude": 145.13227220638203,
                        "speed": 1.2300000190734863
                    },
                    "timestamp": 1433902445042
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.25094683158007,
                        "altitudeAccuracy": 8,
                        "heading": 18.984375,
                        "latitude": -37.91011372584655,
                        "longitude": 145.13227170346784,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1433902446036
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.62985492504617,
                        "altitudeAccuracy": 8,
                        "heading": 18.6328125,
                        "latitude": -37.910102452186784,
                        "longitude": 145.1322655008595,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1433902447053
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.75567088357583,
                        "altitudeAccuracy": 8,
                        "heading": 18.28125,
                        "latitude": -37.9100911366175,
                        "longitude": 145.1322586276989,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1433902448066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.88732414035118,
                        "altitudeAccuracy": 8,
                        "heading": 18.28125,
                        "latitude": -37.91008044969096,
                        "longitude": 145.1322504972528,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1433902449065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.67649297263026,
                        "altitudeAccuracy": 8,
                        "heading": 17.9296875,
                        "latitude": -37.91007454044922,
                        "longitude": 145.13224186389252,
                        "speed": 0.5400000214576721
                    },
                    "timestamp": 1433902450065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.61813546407726,
                        "altitudeAccuracy": 8,
                        "heading": 18.28125,
                        "latitude": -37.91007265452101,
                        "longitude": 145.13223314671322,
                        "speed": 0.8700000047683716
                    },
                    "timestamp": 1433902451067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.68339432030686,
                        "altitudeAccuracy": 8,
                        "heading": 254.8828125,
                        "latitude": -37.91007307361617,
                        "longitude": 145.13221520944043,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1433902452051
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.51218360334263,
                        "altitudeAccuracy": 8,
                        "heading": 254.8828125,
                        "latitude": -37.91007852185323,
                        "longitude": 145.1321924106638,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1433902453045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.56418745229257,
                        "altitudeAccuracy": 6,
                        "heading": 254.8828125,
                        "latitude": -37.910086149385116,
                        "longitude": 145.13217212645813,
                        "speed": 1.2899999618530273
                    },
                    "timestamp": 1433902454045
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.60350127663611,
                        "altitudeAccuracy": 6,
                        "heading": 255.234375,
                        "latitude": -37.91009419601216,
                        "longitude": 145.13215133933826,
                        "speed": 1.5
                    },
                    "timestamp": 1433902455056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.54385254428556,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.9101032903771,
                        "longitude": 145.13213063603743,
                        "speed": 1.5099999904632568
                    },
                    "timestamp": 1433902456066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.51943101072902,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.910114899312994,
                        "longitude": 145.13211269876464,
                        "speed": 1.6299999952316284
                    },
                    "timestamp": 1433902457064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.5557241381598,
                        "altitudeAccuracy": 6,
                        "heading": 255.234375,
                        "latitude": -37.91012529287293,
                        "longitude": 145.13209761133893,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433902458066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.51924478381703,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.91013577025189,
                        "longitude": 145.13208411647483,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1433902459064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.6022384105398,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.9101474210973,
                        "longitude": 145.13206911286815,
                        "speed": 1.4600000381469727
                    },
                    "timestamp": 1433902460064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.79143751395634,
                        "altitudeAccuracy": 6,
                        "heading": 215.15625,
                        "latitude": -37.910161335056564,
                        "longitude": 145.1320546959947,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433902461063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.77874806614122,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.91017260871633,
                        "longitude": 145.13204220695897,
                        "speed": 0.9399999976158142
                    },
                    "timestamp": 1433902462064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.8009017955118,
                        "altitudeAccuracy": 6,
                        "heading": 227.109375,
                        "latitude": -37.91018027815773,
                        "longitude": 145.13203131048485,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1433902463065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.81042705479877,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.91018493011399,
                        "longitude": 145.13202200657233,
                        "speed": 0.4699999988079071
                    },
                    "timestamp": 1433902464065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.93594000977066,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.91018790568962,
                        "longitude": 145.1320092660795,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1433902465065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.90058290767438,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.910193186288616,
                        "longitude": 145.13199350810154,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1433902466067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.90058290767438,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.91019871834471,
                        "longitude": 145.13198629966482,
                        "speed": 0.3799999952316284
                    },
                    "timestamp": 1433902467054
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.85150346068632,
                        "altitudeAccuracy": 6,
                        "heading": 255.5859375,
                        "latitude": -37.91020357984855,
                        "longitude": 145.13198629966482,
                        "speed": 0.20000000298023224
                    },
                    "timestamp": 1433902468052
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.94059463122632,
                        "altitudeAccuracy": 6,
                        "heading": 111.796875,
                        "latitude": -37.91020990818544,
                        "longitude": 145.13199568739637,
                        "speed": 1.0499999523162842
                    },
                    "timestamp": 1433902469064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.8640836201491,
                        "altitudeAccuracy": 6,
                        "heading": 117.0703125,
                        "latitude": -37.910219798831186,
                        "longitude": 145.13201102627917,
                        "speed": 1.2300000190734863
                    },
                    "timestamp": 1433902470064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.82459352308574,
                        "altitudeAccuracy": 6,
                        "heading": 113.203125,
                        "latitude": -37.91023010857209,
                        "longitude": 145.13202795772358,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1433902471065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.7623328136974,
                        "altitudeAccuracy": 6,
                        "heading": 84.375,
                        "latitude": -37.91023874193235,
                        "longitude": 145.13204690082475,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433902472063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.66887216958786,
                        "altitudeAccuracy": 6,
                        "heading": 84.0234375,
                        "latitude": -37.91024238806023,
                        "longitude": 145.13207129216298,
                        "speed": 2.069999933242798
                    },
                    "timestamp": 1433902473063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.74442529878988,
                        "altitudeAccuracy": 6,
                        "heading": 84.0234375,
                        "latitude": -37.91024322625055,
                        "longitude": 145.1320961864154,
                        "speed": 1.7599999904632568
                    },
                    "timestamp": 1433902474066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.82731997309885,
                        "altitudeAccuracy": 6,
                        "heading": 94.5703125,
                        "latitude": -37.91024553127392,
                        "longitude": 145.13211990720137,
                        "speed": 1.8799999952316284
                    },
                    "timestamp": 1433902475064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.74535162019588,
                        "altitudeAccuracy": 6,
                        "heading": 104.4140625,
                        "latitude": -37.91025014132067,
                        "longitude": 145.13214161633059,
                        "speed": 1.5499999523162842
                    },
                    "timestamp": 1433902476064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.72056854925074,
                        "altitudeAccuracy": 6,
                        "heading": 104.4140625,
                        "latitude": -37.91025646965756,
                        "longitude": 145.13216131380304,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1433902477063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.75709254625875,
                        "altitudeAccuracy": 6,
                        "heading": 104.4140625,
                        "latitude": -37.910263803822836,
                        "longitude": 145.1321807598184,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433902478064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.86445927908765,
                        "altitudeAccuracy": 4,
                        "heading": 114.2578125,
                        "latitude": -37.91027205999746,
                        "longitude": 145.13219995437666,
                        "speed": 1.5499999523162842
                    },
                    "timestamp": 1433902479062
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.84150140892059,
                        "altitudeAccuracy": 4,
                        "heading": 114.2578125,
                        "latitude": -37.91027947798177,
                        "longitude": 145.13221923275395,
                        "speed": 1.5
                    },
                    "timestamp": 1433902480065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.86995762992264,
                        "altitudeAccuracy": 4,
                        "heading": 108.6328125,
                        "latitude": -37.91028660259946,
                        "longitude": 145.13223976841672,
                        "speed": 1.649999976158142
                    },
                    "timestamp": 1433902481066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.86090752266433,
                        "altitudeAccuracy": 4,
                        "heading": 120.5859375,
                        "latitude": -37.91029481686457,
                        "longitude": 145.1322597173463,
                        "speed": 1.5399999618530273
                    },
                    "timestamp": 1433902482064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.91595827394745,
                        "altitudeAccuracy": 4,
                        "heading": 120.234375,
                        "latitude": -37.910299636458895,
                        "longitude": 145.13227572678136,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1433902483065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.91688852512276,
                        "altitudeAccuracy": 4,
                        "heading": 95.2734375,
                        "latitude": -37.91030332449629,
                        "longitude": 145.13229584334897,
                        "speed": 2.0199999809265137
                    },
                    "timestamp": 1433902484068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.06794745613884,
                        "altitudeAccuracy": 4,
                        "heading": 95.2734375,
                        "latitude": -37.91030332449629,
                        "longitude": 145.1323213243346,
                        "speed": 2.0899999141693115
                    },
                    "timestamp": 1433902485064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 92.96711807132296,
                        "altitudeAccuracy": 4,
                        "heading": 94.921875,
                        "latitude": -37.91029867254003,
                        "longitude": 145.13234353637802,
                        "speed": 1.659999966621399
                    },
                    "timestamp": 1433902486066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.21225855676097,
                        "altitudeAccuracy": 4,
                        "heading": 94.921875,
                        "latitude": -37.91029645133569,
                        "longitude": 145.13235627687084,
                        "speed": 0.7799999713897705
                    },
                    "timestamp": 1433902487064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.16905504277143,
                        "altitudeAccuracy": 4,
                        "heading": 94.921875,
                        "latitude": -37.910293475760064,
                        "longitude": 145.1323675086211,
                        "speed": 1.5199999809265137
                    },
                    "timestamp": 1433902488066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.29036704447601,
                        "altitudeAccuracy": 4,
                        "heading": 94.921875,
                        "latitude": -37.910289620084605,
                        "longitude": 145.13238192549454,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433902489074
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.4075441709046,
                        "altitudeAccuracy": 4,
                        "heading": 79.8046875,
                        "latitude": -37.91028589013769,
                        "longitude": 145.13239667764412,
                        "speed": 1.4900000095367432
                    },
                    "timestamp": 1433902490065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.39049534732492,
                        "altitudeAccuracy": 4,
                        "heading": 79.8046875,
                        "latitude": -37.9102819506432,
                        "longitude": 145.13241251944112,
                        "speed": 1.5199999809265137
                    },
                    "timestamp": 1433902491068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.34150563717031,
                        "altitudeAccuracy": 4,
                        "heading": 47.8125,
                        "latitude": -37.91027537084921,
                        "longitude": 145.13242341591524,
                        "speed": 0.9599999785423279
                    },
                    "timestamp": 1433902492064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.38015816636461,
                        "altitudeAccuracy": 4,
                        "heading": 47.4609375,
                        "latitude": -37.91027134753569,
                        "longitude": 145.132425427572,
                        "speed": 0.28999999165534973
                    },
                    "timestamp": 1433902493064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.25680387280768,
                        "altitudeAccuracy": 6,
                        "heading": 47.4609375,
                        "latitude": -37.910266150755724,
                        "longitude": 145.13242098516332,
                        "speed": 0.5600000023841858
                    },
                    "timestamp": 1433902494067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.40482349075957,
                        "altitudeAccuracy": 6,
                        "heading": 47.4609375,
                        "latitude": -37.91026116352334,
                        "longitude": 145.1324114297937,
                        "speed": 0.8199999928474426
                    },
                    "timestamp": 1433902495069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.52416257712912,
                        "altitudeAccuracy": 6,
                        "heading": 312.890625,
                        "latitude": -37.91025324262484,
                        "longitude": 145.13239349252092,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433902496068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.41943681532051,
                        "altitudeAccuracy": 6,
                        "heading": 311.484375,
                        "latitude": -37.910245615092954,
                        "longitude": 145.1323768125336,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1433902497066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.47608079782225,
                        "altitudeAccuracy": 6,
                        "heading": 290.0390625,
                        "latitude": -37.91024008303686,
                        "longitude": 145.13236398822175,
                        "speed": 0.8500000238418579
                    },
                    "timestamp": 1433902498067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.48786234939901,
                        "altitudeAccuracy": 6,
                        "heading": 290.0390625,
                        "latitude": -37.910234886256895,
                        "longitude": 145.1323474758725,
                        "speed": 1.399999976158142
                    },
                    "timestamp": 1433902499056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.6310543788621,
                        "altitudeAccuracy": 6,
                        "heading": 290.0390625,
                        "latitude": -37.9102293542008,
                        "longitude": 145.1323268563907,
                        "speed": 1.5700000524520874
                    },
                    "timestamp": 1433902500056
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.44951621031528,
                        "altitudeAccuracy": 6,
                        "heading": 290.390625,
                        "latitude": -37.910225666163406,
                        "longitude": 145.13231059549855,
                        "speed": 0.9300000071525574
                    },
                    "timestamp": 1433902501064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.57215440914455,
                        "altitudeAccuracy": 6,
                        "heading": 290.390625,
                        "latitude": -37.91022424123987,
                        "longitude": 145.1323033032428,
                        "speed": 0.17000000178813934
                    },
                    "timestamp": 1433902502064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.54320612928336,
                        "altitudeAccuracy": 6,
                        "heading": 272.8125,
                        "latitude": -37.91022310968294,
                        "longitude": 145.1322922391306,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1433902503064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.65972097584094,
                        "altitudeAccuracy": 6,
                        "heading": 272.4609375,
                        "latitude": -37.910222732497296,
                        "longitude": 145.13227379894363,
                        "speed": 1.3899999856948853
                    },
                    "timestamp": 1433902504060
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.62993876961212,
                        "altitudeAccuracy": 6,
                        "heading": 272.8125,
                        "latitude": -37.91022134948327,
                        "longitude": 145.13225376619505,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433902505063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.59370125421248,
                        "altitudeAccuracy": 4,
                        "heading": 280.1953125,
                        "latitude": -37.91021942164554,
                        "longitude": 145.13223381726547,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433902506066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.63175046939826,
                        "altitudeAccuracy": 6,
                        "heading": 280.1953125,
                        "latitude": -37.91021682325556,
                        "longitude": 145.13221453888818,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1433902507065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.72493518770162,
                        "altitudeAccuracy": 6,
                        "heading": 279.84375,
                        "latitude": -37.91021422486558,
                        "longitude": 145.13219668543442,
                        "speed": 1.2899999618530273
                    },
                    "timestamp": 1433902508063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.62000186509732,
                        "altitudeAccuracy": 6,
                        "heading": 279.84375,
                        "latitude": -37.91021166838511,
                        "longitude": 145.13217967017098,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1433902509065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.6203729341716,
                        "altitudeAccuracy": 6,
                        "heading": 279.84375,
                        "latitude": -37.91021024346157,
                        "longitude": 145.13216248726948,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1433902510064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.59924533578679,
                        "altitudeAccuracy": 6,
                        "heading": 279.84375,
                        "latitude": -37.91020844135239,
                        "longitude": 145.1321495791386,
                        "speed": 0.9200000166893005
                    },
                    "timestamp": 1433902511065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.65587345942082,
                        "altitudeAccuracy": 6,
                        "heading": 279.84375,
                        "latitude": -37.91020890235706,
                        "longitude": 145.1321376768361,
                        "speed": 1.0199999809265137
                    },
                    "timestamp": 1433902512065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.70242825153105,
                        "altitudeAccuracy": 6,
                        "heading": 276.6796875,
                        "latitude": -37.910210201552054,
                        "longitude": 145.13212175122007,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1433902513066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.76235881643555,
                        "altitudeAccuracy": 6,
                        "heading": 276.328125,
                        "latitude": -37.91021095592334,
                        "longitude": 145.13210347867116,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1433902514064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.71425144463434,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91021179411366,
                        "longitude": 145.1320858766745,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1433902515063
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.73479081913233,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91021326094671,
                        "longitude": 145.13207246562942,
                        "speed": 0.6499999761581421
                    },
                    "timestamp": 1433902516066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.65172927923012,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91021766144588,
                        "longitude": 145.13206324553593,
                        "speed": 0.6700000166893005
                    },
                    "timestamp": 1433902517068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.65525341765293,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.910223738325676,
                        "longitude": 145.1320578811179,
                        "speed": 0.5600000023841858
                    },
                    "timestamp": 1433902518067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.60071055554074,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91023207831933,
                        "longitude": 145.13206089860304,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1433902519061
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.61151880577872,
                        "altitudeAccuracy": 4,
                        "heading": 276.328125,
                        "latitude": -37.91023987348928,
                        "longitude": 145.1320679394017,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1433902520069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.5681072644218,
                        "altitudeAccuracy": 4,
                        "heading": 276.6796875,
                        "latitude": -37.91024687237843,
                        "longitude": 145.13207757859035,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1433902521064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.49930395572454,
                        "altitudeAccuracy": 4,
                        "heading": 276.6796875,
                        "latitude": -37.91025366172,
                        "longitude": 145.13208730159803,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1433902522066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.76324049337616,
                        "altitudeAccuracy": 4,
                        "heading": 126.2109375,
                        "latitude": -37.91026015769496,
                        "longitude": 145.13210155083343,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1433902523067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.64587970043863,
                        "altitudeAccuracy": 4,
                        "heading": 114.609375,
                        "latitude": -37.91026602502718,
                        "longitude": 145.13211848227783,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1433902524067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.74050393065968,
                        "altitudeAccuracy": 4,
                        "heading": 113.90625,
                        "latitude": -37.91026879105522,
                        "longitude": 145.13213566517933,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1433902525067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.67293765973733,
                        "altitudeAccuracy": 3,
                        "heading": 113.5546875,
                        "latitude": -37.91026782713636,
                        "longitude": 145.13215050114795,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1433902526067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.66834882826973,
                        "altitudeAccuracy": 3,
                        "heading": 33.75,
                        "latitude": -37.910261498799464,
                        "longitude": 145.13216240345045,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433902527064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.67646267808153,
                        "altitudeAccuracy": 4,
                        "heading": 33.046875,
                        "latitude": -37.91024980604454,
                        "longitude": 145.13217170736297,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1433902528069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.47780352681572,
                        "altitudeAccuracy": 4,
                        "heading": 32.34375,
                        "latitude": -37.91023505389496,
                        "longitude": 145.1321747248481,
                        "speed": 1.2200000286102295
                    },
                    "timestamp": 1433902529067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.55707011109162,
                        "altitudeAccuracy": 4,
                        "heading": 31.9921875,
                        "latitude": -37.91021854154571,
                        "longitude": 145.13217371901973,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1433902530067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.47606037141276,
                        "altitudeAccuracy": 4,
                        "heading": 26.3671875,
                        "latitude": -37.910203328391454,
                        "longitude": 145.13217321610554,
                        "speed": 1.1100000143051147
                    },
                    "timestamp": 1433902531054
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.26259325517128,
                        "altitudeAccuracy": 4,
                        "heading": 18.6328125,
                        "latitude": -37.91018765423252,
                        "longitude": 145.13217489248618,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1433902532051
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.264225569772,
                        "altitudeAccuracy": 4,
                        "heading": 3.1640625,
                        "latitude": -37.91017294399246,
                        "longitude": 145.13217690414294,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1433902533065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.30383058034307,
                        "altitudeAccuracy": 6,
                        "heading": 4.21875,
                        "latitude": -37.910160413047215,
                        "longitude": 145.13217832906648,
                        "speed": 0.9300000071525574
                    },
                    "timestamp": 1433902534069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.2601153877229,
                        "altitudeAccuracy": 6,
                        "heading": 11.953125,
                        "latitude": -37.91014729536875,
                        "longitude": 145.13217925107583,
                        "speed": 1.059999942779541
                    },
                    "timestamp": 1433902535069
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.18424025180555,
                        "altitudeAccuracy": 6,
                        "heading": 11.6015625,
                        "latitude": -37.910132501309654,
                        "longitude": 145.13218034072324,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1433902536072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.28813587670912,
                        "altitudeAccuracy": 6,
                        "heading": 11.953125,
                        "latitude": -37.91011716242685,
                        "longitude": 145.1321852860461,
                        "speed": 1.4900000095367432
                    },
                    "timestamp": 1433902537068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.31524247960701,
                        "altitudeAccuracy": 6,
                        "heading": 11.25,
                        "latitude": -37.910100524349055,
                        "longitude": 145.13218780061706,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1433902538066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.30862088204017,
                        "altitudeAccuracy": 6,
                        "heading": 11.25,
                        "latitude": -37.910085856018505,
                        "longitude": 145.13219039900704,
                        "speed": 1.149999976158142
                    },
                    "timestamp": 1433902539067
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.41590463066474,
                        "altitudeAccuracy": 6,
                        "heading": 10.8984375,
                        "latitude": -37.91007378607794,
                        "longitude": 145.1321960987012,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1433902540072
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.5037476508232,
                        "altitudeAccuracy": 6,
                        "heading": 51.6796875,
                        "latitude": -37.91006330869897,
                        "longitude": 145.1322045644234,
                        "speed": 1.3300000429153442
                    },
                    "timestamp": 1433902541064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.40426699340101,
                        "altitudeAccuracy": 6,
                        "heading": 10.1953125,
                        "latitude": -37.910055806895635,
                        "longitude": 145.13221420361205,
                        "speed": 0.9700000286102295
                    },
                    "timestamp": 1433902542068
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.40253157496801,
                        "altitudeAccuracy": 6,
                        "heading": 10.1953125,
                        "latitude": -37.91004977192535,
                        "longitude": 145.1322222502391,
                        "speed": 0.8299999833106995
                    },
                    "timestamp": 1433902543065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.4414458307257,
                        "altitudeAccuracy": 6,
                        "heading": 9.84375,
                        "latitude": -37.910045874340376,
                        "longitude": 145.13223172178968,
                        "speed": 1.0399999618530273
                    },
                    "timestamp": 1433902544066
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.48933999977908,
                        "altitudeAccuracy": 6,
                        "heading": 10.1953125,
                        "latitude": -37.9100430244933,
                        "longitude": 145.13224538429185,
                        "speed": 1.3300000429153442
                    },
                    "timestamp": 1433902545064
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.54972153346172,
                        "altitudeAccuracy": 6,
                        "heading": 10.1953125,
                        "latitude": -37.91004239585056,
                        "longitude": 145.1322583762418,
                        "speed": 1.0099999904632568
                    },
                    "timestamp": 1433902546065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.41165230189105,
                        "altitudeAccuracy": 6,
                        "heading": 9.84375,
                        "latitude": -37.91004017464622,
                        "longitude": 145.13226566849755,
                        "speed": 0.5400000214576721
                    },
                    "timestamp": 1433902547065
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 93.48650942658222,
                        "altitudeAccuracy": 6,
                        "heading": 9.84375,
                        "latitude": -37.91003761816575,
                        "longitude": 145.1322679316114,
                        "speed": 0.23000000417232513
                    },
                    "timestamp": 1433902548064
                }
            ]
        },
        {
            title: "Caulfield Green",
            locations: [
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.408935546875,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406935999
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.42108154296875,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406936999
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.41717529296875,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406937999
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.4625244140625,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406938999
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.45770263671875,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406939999
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.46502685546875,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406940999
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.4678955078125,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406941999
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": 86.54473876953125,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406942999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.5823974609375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406943999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.61932373046875,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406944999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.6722412109375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406945999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.7193603515625,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406946999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.7333984375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406947999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.87225341796875,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406948999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.89715576171875,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406949999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.98974609375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406950999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 85.6046142578125,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -37.87700131073396,
                        "longitude": 145.04411553977528,
                        "speed": 0
                    },
                    "timestamp": 1473406951999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 84.98779296875,
                        "altitudeAccuracy": 12,
                        "heading": 213.3984375,
                        "latitude": -37.876891088707254,
                        "longitude": 145.0441071578721,
                        "speed": 0.2800000011920929
                    },
                    "timestamp": 1473406952999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 86.17327880859375,
                        "altitudeAccuracy": 12,
                        "heading": 215.5078125,
                        "latitude": -37.87690206900041,
                        "longitude": 145.0441000332544,
                        "speed": 0.8600000143051147
                    },
                    "timestamp": 1473406953999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 82.31903076171875,
                        "altitudeAccuracy": 12,
                        "heading": 203.5546875,
                        "latitude": -37.87688232961844,
                        "longitude": 145.04407974904873,
                        "speed": 0.8600000143051147
                    },
                    "timestamp": 1473406954999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 78.7740478515625,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.87683891136001,
                        "longitude": 145.04407371407845,
                        "speed": 0.8600000143051147
                    },
                    "timestamp": 1473406955999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 78.31640625,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.87682394966285,
                        "longitude": 145.04407430081167,
                        "speed": 0.9100000262260437
                    },
                    "timestamp": 1473406956999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 79.07073974609375,
                        "altitudeAccuracy": 12,
                        "heading": 210.234375,
                        "latitude": -37.87680806595634,
                        "longitude": 145.04407379789748,
                        "speed": 0.9700000286102295
                    },
                    "timestamp": 1473406957999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 78.7879638671875,
                        "altitudeAccuracy": 12,
                        "heading": 214.8046875,
                        "latitude": -37.87679821722011,
                        "longitude": 145.0440629852424,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1473406958999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 77.17413330078125,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.87676544397871,
                        "longitude": 145.0440648292611,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1473406959999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 77.56378173828125,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.87677244286786,
                        "longitude": 145.04406047067144,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1473406960999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 76.7296142578125,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.87677831020008,
                        "longitude": 145.04405443570116,
                        "speed": 1.309999942779541
                    },
                    "timestamp": 1473406961999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 76.97271728515625,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.87678451280843,
                        "longitude": 145.0440482330928,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1473406962999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 76.08917236328125,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.87678820084582,
                        "longitude": 145.044043455408,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1473406963999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 77.1395263671875,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.876792643254504,
                        "longitude": 145.04403918063738,
                        "speed": 1.0099999904632568
                    },
                    "timestamp": 1473406964999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 76.08551025390625,
                        "altitudeAccuracy": 12,
                        "heading": 209.8828125,
                        "latitude": -37.87679524164449,
                        "longitude": 145.04403566023805,
                        "speed": 0.8600000143051147
                    },
                    "timestamp": 1473406965999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 75.07769775390625,
                        "altitudeAccuracy": 12,
                        "heading": 204.609375,
                        "latitude": -37.87679863631527,
                        "longitude": 145.04403230747678,
                        "speed": 1.0099999904632568
                    },
                    "timestamp": 1473406966999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 74.669921875,
                        "altitudeAccuracy": 12,
                        "heading": 204.609375,
                        "latitude": -37.87680115088622,
                        "longitude": 145.04402853562036,
                        "speed": 1.1100000143051147
                    },
                    "timestamp": 1473406967999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 73.4212646484375,
                        "altitudeAccuracy": 12,
                        "heading": 204.609375,
                        "latitude": -37.876801737619445,
                        "longitude": 145.0440262725065,
                        "speed": 1.1100000143051147
                    },
                    "timestamp": 1473406968999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 73.6494140625,
                        "altitudeAccuracy": 12,
                        "heading": 204.609375,
                        "latitude": -37.876804377918944,
                        "longitude": 145.04402350647845,
                        "speed": 1.0499999523162842
                    },
                    "timestamp": 1473406969999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 74.90045166015625,
                        "altitudeAccuracy": 12,
                        "heading": 205.6640625,
                        "latitude": -37.87681049670826,
                        "longitude": 145.04401973462203,
                        "speed": 1.0499999523162842
                    },
                    "timestamp": 1473406970999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 75.548828125,
                        "altitudeAccuracy": 12,
                        "heading": 206.015625,
                        "latitude": -37.876815693488226,
                        "longitude": 145.0440157113085,
                        "speed": 1
                    },
                    "timestamp": 1473406971999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 74.78668212890625,
                        "altitudeAccuracy": 12,
                        "heading": 206.015625,
                        "latitude": -37.876821351272866,
                        "longitude": 145.0440088381479,
                        "speed": 1.2899999618530273
                    },
                    "timestamp": 1473406972999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 74.6051025390625,
                        "altitudeAccuracy": 12,
                        "heading": 206.015625,
                        "latitude": -37.87682583559106,
                        "longitude": 145.04400338991084,
                        "speed": 1
                    },
                    "timestamp": 1473406973999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 74.785888671875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768299008141,
                        "longitude": 145.04399945041635,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1473406974999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 74.190673828125,
                        "altitudeAccuracy": 8,
                        "heading": 207.0703125,
                        "latitude": -37.8768351814131,
                        "longitude": 145.04399425363638,
                        "speed": 1.0199999809265137
                    },
                    "timestamp": 1473406975999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 73.43267822265625,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.8768378217126,
                        "longitude": 145.04398972740867,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473406976999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 72.0081787109375,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.87683995909791,
                        "longitude": 145.0439836924384,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473406977999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 72.569091796875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.87684155165951,
                        "longitude": 145.0439797529439,
                        "speed": 0.7699999809265137
                    },
                    "timestamp": 1473406978999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 71.1527099609375,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0.44999998807907104
                    },
                    "timestamp": 1473406979999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 70.20477294921875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406980999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 69.865478515625,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406981999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 69.180419921875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406982999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 68.83544921875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406983999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 68.2149658203125,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406984999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 68.06866455078125,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406985999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.948974609375,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406986999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.5013427734375,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406987999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.26739501953125,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406988999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.060302734375,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406989999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.1817626953125,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406990999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.10125732421875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406991999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.1767578125,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406992999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.109619140625,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406993999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.17205810546875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406994999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.16668701171875,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406995999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.17425537109375,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406996999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.2545166015625,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406997999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.29693603515625,
                        "altitudeAccuracy": 12,
                        "heading": 207.421875,
                        "latitude": -37.8768431023116,
                        "longitude": 145.04397748983004,
                        "speed": 0
                    },
                    "timestamp": 1473406998999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.55828857421875,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0.6200000047683716
                    },
                    "timestamp": 1473406999999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 66.35906982421875,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407000999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 66.7098388671875,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407001999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 66.5643310546875,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407002999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 66.19708251953125,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407003999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 63.5137939453125,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407004999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 61.812744140625,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407005999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 59.7174072265625,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407006999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.6248779296875,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407007999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 56.60357666015625,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407008999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 56.37237548828125,
                        "altitudeAccuracy": 8,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407009999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 56.12103271484375,
                        "altitudeAccuracy": 8,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407010999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 56.59674072265625,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407011999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 56.940185546875,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407012999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.5458984375,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407013999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.41168212890625,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407014999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.482177734375,
                        "altitudeAccuracy": 12,
                        "heading": 207.0703125,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407015999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 57.7261962890625,
                        "altitudeAccuracy": 12,
                        "heading": 228.8671875,
                        "latitude": -37.876809826156006,
                        "longitude": 145.04397388561168,
                        "speed": 0
                    },
                    "timestamp": 1473407016999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.12127685546875,
                        "altitudeAccuracy": 12,
                        "heading": 210.5859375,
                        "latitude": -37.87680873650859,
                        "longitude": 145.04393951980867,
                        "speed": 1.1399999856948853
                    },
                    "timestamp": 1473407017999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.65814208984375,
                        "altitudeAccuracy": 12,
                        "heading": 195.8203125,
                        "latitude": -37.87682587750058,
                        "longitude": 145.04393382011452,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1473407018999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.560302734375,
                        "altitudeAccuracy": 12,
                        "heading": 197.2265625,
                        "latitude": -37.87684377286385,
                        "longitude": 145.04393046735325,
                        "speed": 1.25
                    },
                    "timestamp": 1473407019999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 62.70184326171875,
                        "altitudeAccuracy": 12,
                        "heading": 200.390625,
                        "latitude": -37.876861039584384,
                        "longitude": 145.04392862333455,
                        "speed": 1.25
                    },
                    "timestamp": 1473407020999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 64.24468994140625,
                        "altitudeAccuracy": 12,
                        "heading": 197.9296875,
                        "latitude": -37.87687637846719,
                        "longitude": 145.04392518675425,
                        "speed": 0.9900000095367432
                    },
                    "timestamp": 1473407021999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 64.2816162109375,
                        "altitudeAccuracy": 12,
                        "heading": 194.765625,
                        "latitude": -37.87689100488822,
                        "longitude": 145.04392342655458,
                        "speed": 0.9900000095367432
                    },
                    "timestamp": 1473407022999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 64.40472412109375,
                        "altitudeAccuracy": 12,
                        "heading": 186.328125,
                        "latitude": -37.87690215281944,
                        "longitude": 145.043924516202,
                        "speed": 0.8500000238418579
                    },
                    "timestamp": 1473407023999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 65.0489501953125,
                        "altitudeAccuracy": 12,
                        "heading": 189.4921875,
                        "latitude": -37.87691346838872,
                        "longitude": 145.0439231750975,
                        "speed": 0.7099999785423279
                    },
                    "timestamp": 1473407024999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 65.8475341796875,
                        "altitudeAccuracy": 12,
                        "heading": 193.359375,
                        "latitude": -37.87693069319974,
                        "longitude": 145.04391747540333,
                        "speed": 1.1100000143051147
                    },
                    "timestamp": 1473407025999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.9002685546875,
                        "altitudeAccuracy": 12,
                        "heading": 189.4921875,
                        "latitude": -37.876943894697234,
                        "longitude": 145.04391546374657,
                        "speed": 0.7099999785423279
                    },
                    "timestamp": 1473407026999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.85076904296875,
                        "altitudeAccuracy": 12,
                        "heading": 158.90625,
                        "latitude": -37.876952989062175,
                        "longitude": 145.04391655339398,
                        "speed": 0.4699999988079071
                    },
                    "timestamp": 1473407027999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.50115966796875,
                        "altitudeAccuracy": 12,
                        "heading": 148.7109375,
                        "latitude": -37.87696589719306,
                        "longitude": 145.04391797831752,
                        "speed": 0.4699999988079071
                    },
                    "timestamp": 1473407028999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.70648193359375,
                        "altitudeAccuracy": 12,
                        "heading": 176.1328125,
                        "latitude": -37.8769810684378,
                        "longitude": 145.04391730776527,
                        "speed": 0.7200000286102295
                    },
                    "timestamp": 1473407029999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.10498046875,
                        "altitudeAccuracy": 12,
                        "heading": 197.578125,
                        "latitude": -37.876998838072524,
                        "longitude": 145.04391085369983,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1473407030999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.66925048828125,
                        "altitudeAccuracy": 8,
                        "heading": 200.0390625,
                        "latitude": -37.87701442841242,
                        "longitude": 145.04390448345342,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1473407031999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 65.2816162109375,
                        "altitudeAccuracy": 8,
                        "heading": 204.2578125,
                        "latitude": -37.8770259954388,
                        "longitude": 145.04389962194958,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1473407032999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 64.96923828125,
                        "altitudeAccuracy": 8,
                        "heading": 204.609375,
                        "latitude": -37.87703701764147,
                        "longitude": 145.04389476044574,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1473407033999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 63.94384765625,
                        "altitudeAccuracy": 8,
                        "heading": 204.9609375,
                        "latitude": -37.87704946476768,
                        "longitude": 145.04388771964707,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1473407034999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 64.06121826171875,
                        "altitudeAccuracy": 8,
                        "heading": 205.3125,
                        "latitude": -37.87706019360374,
                        "longitude": 145.04388134940066,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407035999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 63.6307373046875,
                        "altitudeAccuracy": 8,
                        "heading": 205.6640625,
                        "latitude": -37.877070545254156,
                        "longitude": 145.04387556588748,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1473407036999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 62.9464111328125,
                        "altitudeAccuracy": 8,
                        "heading": 206.3671875,
                        "latitude": -37.877081777004406,
                        "longitude": 145.0438687765459,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1473407037999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 62.589599609375,
                        "altitudeAccuracy": 8,
                        "heading": 209.8828125,
                        "latitude": -37.87709212865482,
                        "longitude": 145.04386098137596,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407038999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 62.48779296875,
                        "altitudeAccuracy": 6,
                        "heading": 212.34375,
                        "latitude": -37.8771002591009,
                        "longitude": 145.04385385675826,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407039999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 60.75048828125,
                        "altitudeAccuracy": 6,
                        "heading": 252.7734375,
                        "latitude": -37.87710742562811,
                        "longitude": 145.0438370091329,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407040999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 59.746337890625,
                        "altitudeAccuracy": 6,
                        "heading": 252.0703125,
                        "latitude": -37.87711270622711,
                        "longitude": 145.04381597055593,
                        "speed": 1.6100000143051147
                    },
                    "timestamp": 1473407041999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 59.627685546875,
                        "altitudeAccuracy": 6,
                        "heading": 251.3671875,
                        "latitude": -37.87711299959372,
                        "longitude": 145.04380255951085,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473407042999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 59.08203125,
                        "altitudeAccuracy": 6,
                        "heading": 251.3671875,
                        "latitude": -37.87711228713195,
                        "longitude": 145.04379694363573,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473407043999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 58.346923828125,
                        "altitudeAccuracy": 8,
                        "heading": 251.015625,
                        "latitude": -37.877111323213086,
                        "longitude": 145.04379677599766,
                        "speed": 0.15000000596046448
                    },
                    "timestamp": 1473407044999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 58.455322265625,
                        "altitudeAccuracy": 8,
                        "heading": 250.6640625,
                        "latitude": -37.87711404733162,
                        "longitude": 145.04380281096795,
                        "speed": 0.41999998688697815
                    },
                    "timestamp": 1473407045999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.9241943359375,
                        "altitudeAccuracy": 8,
                        "heading": 250.6640625,
                        "latitude": -37.87711752582143,
                        "longitude": 145.0438153838227,
                        "speed": 0.5299999713897705
                    },
                    "timestamp": 1473407046999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.41387939453125,
                        "altitudeAccuracy": 8,
                        "heading": 99.140625,
                        "latitude": -37.877119537478194,
                        "longitude": 145.04383608712354,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407047999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 57.8067626953125,
                        "altitudeAccuracy": 8,
                        "heading": 94.921875,
                        "latitude": -37.877119537478194,
                        "longitude": 145.04385972409048,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407048999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 56.058837890625,
                        "altitudeAccuracy": 8,
                        "heading": 92.4609375,
                        "latitude": -37.87711957938771,
                        "longitude": 145.0438788348297,
                        "speed": 1.3600000143051147
                    },
                    "timestamp": 1473407049999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 53.47906494140625,
                        "altitudeAccuracy": 8,
                        "heading": 93.515625,
                        "latitude": -37.87712024993996,
                        "longitude": 145.04389115622737,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407050999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 52.54254150390625,
                        "altitudeAccuracy": 8,
                        "heading": 94.921875,
                        "latitude": -37.877121255768344,
                        "longitude": 145.04390138214924,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1473407051999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 53.5194091796875,
                        "altitudeAccuracy": 8,
                        "heading": 100.546875,
                        "latitude": -37.87712460852961,
                        "longitude": 145.04391496083238,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1473407052999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 53.6807861328125,
                        "altitudeAccuracy": 8,
                        "heading": 106.5234375,
                        "latitude": -37.87712896711926,
                        "longitude": 145.04393122172453,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1473407053999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 53.73822021484375,
                        "altitudeAccuracy": 8,
                        "heading": 110.7421875,
                        "latitude": -37.87713395435165,
                        "longitude": 145.04394756643572,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1473407054999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 54.31756591796875,
                        "altitudeAccuracy": 12,
                        "heading": 109.6875,
                        "latitude": -37.87713998932193,
                        "longitude": 145.04396491697528,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1473407055999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 55.33642578125,
                        "altitudeAccuracy": 12,
                        "heading": 106.171875,
                        "latitude": -37.87714514419238,
                        "longitude": 145.04398536881902,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407056999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 55.9056396484375,
                        "altitudeAccuracy": 12,
                        "heading": 101.25,
                        "latitude": -37.87714962851058,
                        "longitude": 145.04401126889982,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407057999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.3131103515625,
                        "altitudeAccuracy": 12,
                        "heading": 107.578125,
                        "latitude": -37.87715570539038,
                        "longitude": 145.0440336485813,
                        "speed": 1.5199999809265137
                    },
                    "timestamp": 1473407058999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 54.91339111328125,
                        "altitudeAccuracy": 12,
                        "heading": 112.1484375,
                        "latitude": -37.87716463211726,
                        "longitude": 145.04405275932052,
                        "speed": 1.659999966621399
                    },
                    "timestamp": 1473407059999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.201904296875,
                        "altitudeAccuracy": 12,
                        "heading": 114.609375,
                        "latitude": -37.87716873924981,
                        "longitude": 145.04406977458396,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1473407060999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 57.34014892578125,
                        "altitudeAccuracy": 12,
                        "heading": 108.984375,
                        "latitude": -37.87717121191125,
                        "longitude": 145.0440891367803,
                        "speed": 1.4500000476837158
                    },
                    "timestamp": 1473407061999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 57.00286865234375,
                        "altitudeAccuracy": 12,
                        "heading": 100.8984375,
                        "latitude": -37.8771718824635,
                        "longitude": 145.04410933716693,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1473407062999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 57.12274169921875,
                        "altitudeAccuracy": 12,
                        "heading": 99.84375,
                        "latitude": -37.87717318165849,
                        "longitude": 145.0441298728297,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1473407063999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 57.895263671875,
                        "altitudeAccuracy": 12,
                        "heading": 100.1953125,
                        "latitude": -37.877173852210746,
                        "longitude": 145.04414948648312,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1473407064999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 57.952392578125,
                        "altitudeAccuracy": 12,
                        "heading": 103.7109375,
                        "latitude": -37.87717653441976,
                        "longitude": 145.04416541209915,
                        "speed": 1.25
                    },
                    "timestamp": 1473407065999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.09478759765625,
                        "altitudeAccuracy": 12,
                        "heading": 107.578125,
                        "latitude": -37.87717988718103,
                        "longitude": 145.04418175681033,
                        "speed": 1.25
                    },
                    "timestamp": 1473407066999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.2398681640625,
                        "altitudeAccuracy": 12,
                        "heading": 107.9296875,
                        "latitude": -37.87718269511859,
                        "longitude": 145.04419642514088,
                        "speed": 1.25
                    },
                    "timestamp": 1473407067999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 58.5784912109375,
                        "altitudeAccuracy": 8,
                        "heading": 101.6015625,
                        "latitude": -37.877184581046805,
                        "longitude": 145.04421134492853,
                        "speed": 1.25
                    },
                    "timestamp": 1473407068999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 58.66815185546875,
                        "altitudeAccuracy": 8,
                        "heading": 88.2421875,
                        "latitude": -37.8771848325039,
                        "longitude": 145.0442276896397,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1473407069999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.5357666015625,
                        "altitudeAccuracy": 12,
                        "heading": 87.890625,
                        "latitude": -37.877182359842465,
                        "longitude": 145.04424185505607,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1473407070999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.8106689453125,
                        "altitudeAccuracy": 12,
                        "heading": 87.890625,
                        "latitude": -37.87717967763345,
                        "longitude": 145.04425635574856,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1473407071999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.6727294921875,
                        "altitudeAccuracy": 12,
                        "heading": 88.9453125,
                        "latitude": -37.87718076728086,
                        "longitude": 145.04426959915557,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407072999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.36199951171875,
                        "altitudeAccuracy": 12,
                        "heading": 88.9453125,
                        "latitude": -37.87718118637602,
                        "longitude": 145.0442847704003,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407073999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.2227783203125,
                        "altitudeAccuracy": 12,
                        "heading": 87.1875,
                        "latitude": -37.877179929090545,
                        "longitude": 145.04429818144538,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1473407074999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.80926513671875,
                        "altitudeAccuracy": 12,
                        "heading": 76.640625,
                        "latitude": -37.8771779593433,
                        "longitude": 145.04431259831884,
                        "speed": 1.3300000429153442
                    },
                    "timestamp": 1473407075999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.068603515625,
                        "altitudeAccuracy": 12,
                        "heading": 76.9921875,
                        "latitude": -37.87717552859138,
                        "longitude": 145.04432927830615,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1473407076999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 55.93353271484375,
                        "altitudeAccuracy": 8,
                        "heading": 76.9921875,
                        "latitude": -37.87717309783946,
                        "longitude": 145.04434662884572,
                        "speed": 1.190000057220459
                    },
                    "timestamp": 1473407077999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 55.4547119140625,
                        "altitudeAccuracy": 8,
                        "heading": 76.9921875,
                        "latitude": -37.87717146336834,
                        "longitude": 145.044365907223,
                        "speed": 1.100000023841858
                    },
                    "timestamp": 1473407078999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 55.783447265625,
                        "altitudeAccuracy": 8,
                        "heading": 76.640625,
                        "latitude": -37.877169619349644,
                        "longitude": 145.04438560469546,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1473407079999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.6119384765625,
                        "altitudeAccuracy": 8,
                        "heading": 76.640625,
                        "latitude": -37.877167272416756,
                        "longitude": 145.04440622417727,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1473407080999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.41168212890625,
                        "altitudeAccuracy": 8,
                        "heading": 81.5625,
                        "latitude": -37.87716467402677,
                        "longitude": 145.04442701129713,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407081999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.87353515625,
                        "altitudeAccuracy": 12,
                        "heading": 78.046875,
                        "latitude": -37.87716106980841,
                        "longitude": 145.04444494856992,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407082999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 56.92987060546875,
                        "altitudeAccuracy": 12,
                        "heading": 73.125,
                        "latitude": -37.87715578920941,
                        "longitude": 145.04446062272885,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1473407083999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.1461181640625,
                        "altitudeAccuracy": 12,
                        "heading": 68.5546875,
                        "latitude": -37.87714820358704,
                        "longitude": 145.04447562633553,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1473407084999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.91632080078125,
                        "altitudeAccuracy": 12,
                        "heading": 62.9296875,
                        "latitude": -37.87713839676033,
                        "longitude": 145.04449188722768,
                        "speed": 1.190000057220459
                    },
                    "timestamp": 1473407085999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 59.0281982421875,
                        "altitudeAccuracy": 12,
                        "heading": 60.1171875,
                        "latitude": -37.87712804510991,
                        "longitude": 145.04450630410113,
                        "speed": 1.1699999570846558
                    },
                    "timestamp": 1473407086999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 59.47955322265625,
                        "altitudeAccuracy": 12,
                        "heading": 60.8203125,
                        "latitude": -37.8771174420024,
                        "longitude": 145.04452239735522,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1473407087999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 60.34466552734375,
                        "altitudeAccuracy": 12,
                        "heading": 64.3359375,
                        "latitude": -37.877106461709246,
                        "longitude": 145.04453966407576,
                        "speed": 1.4700000286102295
                    },
                    "timestamp": 1473407088999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 61.5238037109375,
                        "altitudeAccuracy": 12,
                        "heading": 66.796875,
                        "latitude": -37.87709590051125,
                        "longitude": 145.0445569307963,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407089999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 62.5882568359375,
                        "altitudeAccuracy": 12,
                        "heading": 69.609375,
                        "latitude": -37.87709003317903,
                        "longitude": 145.04457771791616,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407090999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 59.83392333984375,
                        "altitudeAccuracy": 12,
                        "heading": 68.5546875,
                        "latitude": -37.87708722524147,
                        "longitude": 145.04459146423736,
                        "speed": 0.7699999809265137
                    },
                    "timestamp": 1473407091999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 61.84906005859375,
                        "altitudeAccuracy": 12,
                        "heading": 47.8125,
                        "latitude": -37.877080561628446,
                        "longitude": 145.04460194161632,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1473407092999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 63.808837890625,
                        "altitudeAccuracy": 12,
                        "heading": 3.8671875,
                        "latitude": -37.87706740204047,
                        "longitude": 145.0446105749766,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1473407093999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 64.80169677734375,
                        "altitudeAccuracy": 12,
                        "heading": 3.8671875,
                        "latitude": -37.877051853610084,
                        "longitude": 145.0446135086427,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1473407094999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 66.53094482421875,
                        "altitudeAccuracy": 12,
                        "heading": 4.21875,
                        "latitude": -37.87703881975065,
                        "longitude": 145.04461677758493,
                        "speed": 1.350000023841858
                    },
                    "timestamp": 1473407095999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 66.68927001953125,
                        "altitudeAccuracy": 12,
                        "heading": 4.21875,
                        "latitude": -37.87702800709556,
                        "longitude": 145.0446198788891,
                        "speed": 1.0199999809265137
                    },
                    "timestamp": 1473407096999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.5657958984375,
                        "altitudeAccuracy": 12,
                        "heading": 3.8671875,
                        "latitude": -37.87701706871192,
                        "longitude": 145.04462348310747,
                        "speed": 1.2799999713897705
                    },
                    "timestamp": 1473407097999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.467529296875,
                        "altitudeAccuracy": 12,
                        "heading": 13.0078125,
                        "latitude": -37.87700545977603,
                        "longitude": 145.04462633295455,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1473407098999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 66.179931640625,
                        "altitudeAccuracy": 12,
                        "heading": 26.015625,
                        "latitude": -37.876994060387716,
                        "longitude": 145.0446293504397,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1473407099999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.00006103515625,
                        "altitudeAccuracy": 12,
                        "heading": 26.015625,
                        "latitude": -37.87698504984181,
                        "longitude": 145.04463035626807,
                        "speed": 0.800000011920929
                    },
                    "timestamp": 1473407100999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.74078369140625,
                        "altitudeAccuracy": 12,
                        "heading": 25.3125,
                        "latitude": -37.87697386000107,
                        "longitude": 145.04463027244904,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1473407101999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.1915283203125,
                        "altitudeAccuracy": 12,
                        "heading": 24.9609375,
                        "latitude": -37.87695952694665,
                        "longitude": 145.04462767405906,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1473407102999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 67.7017822265625,
                        "altitudeAccuracy": 12,
                        "heading": 24.609375,
                        "latitude": -37.87694678645383,
                        "longitude": 145.04462365074554,
                        "speed": 1.3799999952316284
                    },
                    "timestamp": 1473407103999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 68.35284423828125,
                        "altitudeAccuracy": 12,
                        "heading": 24.2578125,
                        "latitude": -37.876936392893896,
                        "longitude": 145.0446198788891,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473407104999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 68.6529541015625,
                        "altitudeAccuracy": 12,
                        "heading": 24.2578125,
                        "latitude": -37.876925161143646,
                        "longitude": 145.04461711286106,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1473407105999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 69.05865478515625,
                        "altitudeAccuracy": 12,
                        "heading": 23.90625,
                        "latitude": -37.87691418085049,
                        "longitude": 145.04461493356624,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1473407106999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 69.7730712890625,
                        "altitudeAccuracy": 12,
                        "heading": 24.2578125,
                        "latitude": -37.87690613422345,
                        "longitude": 145.04461702904203,
                        "speed": 0.7099999785423279
                    },
                    "timestamp": 1473407107999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 69.90313720703125,
                        "altitudeAccuracy": 12,
                        "heading": 24.2578125,
                        "latitude": -37.876897039858505,
                        "longitude": 145.04461971125104,
                        "speed": 0.6299999952316284
                    },
                    "timestamp": 1473407108999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.9471435546875,
                        "altitudeAccuracy": 12,
                        "heading": 24.2578125,
                        "latitude": -37.876897039858505,
                        "longitude": 145.04461971125104,
                        "speed": 0
                    },
                    "timestamp": 1473407109999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.2603759765625,
                        "altitudeAccuracy": 12,
                        "heading": 340.6640625,
                        "latitude": -37.87688647866051,
                        "longitude": 145.04462004652717,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473407110999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.96405029296875,
                        "altitudeAccuracy": 12,
                        "heading": 24.2578125,
                        "latitude": -37.87688040178071,
                        "longitude": 145.04461225135722,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473407111999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.68621826171875,
                        "altitudeAccuracy": 12,
                        "heading": 284.4140625,
                        "latitude": -37.87687717474799,
                        "longitude": 145.04459917558827,
                        "speed": 0.8999999761581421
                    },
                    "timestamp": 1473407112999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 72.76031494140625,
                        "altitudeAccuracy": 12,
                        "heading": 278.0859375,
                        "latitude": -37.876875791733966,
                        "longitude": 145.04458475871482,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1473407113999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 69.925048828125,
                        "altitudeAccuracy": 12,
                        "heading": 278.7890625,
                        "latitude": -37.87687273233931,
                        "longitude": 145.04456958747008,
                        "speed": 0.9900000095367432
                    },
                    "timestamp": 1473407114999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.7493896484375,
                        "altitudeAccuracy": 12,
                        "heading": 278.7890625,
                        "latitude": -37.876868709025786,
                        "longitude": 145.04455441622534,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1473407115999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.05548095703125,
                        "altitudeAccuracy": 12,
                        "heading": 279.140625,
                        "latitude": -37.876863051241145,
                        "longitude": 145.04453823915222,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1473407116999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.30926513671875,
                        "altitudeAccuracy": 12,
                        "heading": 286.171875,
                        "latitude": -37.87685592662345,
                        "longitude": 145.04452097243168,
                        "speed": 1.1100000143051147
                    },
                    "timestamp": 1473407117999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.30694580078125,
                        "altitudeAccuracy": 12,
                        "heading": 286.171875,
                        "latitude": -37.876849095372364,
                        "longitude": 145.04450286752083,
                        "speed": 1.309999942779541
                    },
                    "timestamp": 1473407118999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.69476318359375,
                        "altitudeAccuracy": 12,
                        "heading": 285.8203125,
                        "latitude": -37.87684406623046,
                        "longitude": 145.04448551698127,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1473407119999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.748291015625,
                        "altitudeAccuracy": 12,
                        "heading": 285.46875,
                        "latitude": -37.876842222211764,
                        "longitude": 145.0444729441265,
                        "speed": 1.1299999952316284
                    },
                    "timestamp": 1473407120999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.03936767578125,
                        "altitudeAccuracy": 12,
                        "heading": 285.46875,
                        "latitude": -37.87684213839273,
                        "longitude": 145.0444615447382,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1473407121999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.99688720703125,
                        "altitudeAccuracy": 12,
                        "heading": 277.03125,
                        "latitude": -37.87684171929757,
                        "longitude": 145.04444670876958,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1473407122999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.5927734375,
                        "altitudeAccuracy": 12,
                        "heading": 272.4609375,
                        "latitude": -37.8768404620121,
                        "longitude": 145.04442843622067,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1473407123999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 71.0242919921875,
                        "altitudeAccuracy": 12,
                        "heading": 271.7578125,
                        "latitude": -37.87684062965016,
                        "longitude": 145.04440966075757,
                        "speed": 1.3700000047683716
                    },
                    "timestamp": 1473407124999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 69.83856201171875,
                        "altitudeAccuracy": 12,
                        "heading": 271.7578125,
                        "latitude": -37.87684025246452,
                        "longitude": 145.0443912205706,
                        "speed": 1.2100000381469727
                    },
                    "timestamp": 1473407125999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.15997314453125,
                        "altitudeAccuracy": 8,
                        "heading": 271.7578125,
                        "latitude": -37.87683912090759,
                        "longitude": 145.0443727803836,
                        "speed": 1.2899999618530273
                    },
                    "timestamp": 1473407126999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.0478515625,
                        "altitudeAccuracy": 8,
                        "heading": 271.40625,
                        "latitude": -37.87683878563146,
                        "longitude": 145.04435484311082,
                        "speed": 1.2899999618530273
                    },
                    "timestamp": 1473407127999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.45477294921875,
                        "altitudeAccuracy": 8,
                        "heading": 270.703125,
                        "latitude": -37.87683991718839,
                        "longitude": 145.04433824694254,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1473407128999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.82269287109375,
                        "altitudeAccuracy": 8,
                        "heading": 287.2265625,
                        "latitude": -37.876838156988725,
                        "longitude": 145.04431846565106,
                        "speed": 1.9700000286102295
                    },
                    "timestamp": 1473407129999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.9552001953125,
                        "altitudeAccuracy": 8,
                        "heading": 287.578125,
                        "latitude": -37.87683689970325,
                        "longitude": 145.04430069601634,
                        "speed": 1.409999966621399
                    },
                    "timestamp": 1473407130999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 70.425537109375,
                        "altitudeAccuracy": 8,
                        "heading": 287.9296875,
                        "latitude": -37.87683581005584,
                        "longitude": 145.04428426748612,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1473407131999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 69.6517333984375,
                        "altitudeAccuracy": 8,
                        "heading": 281.6015625,
                        "latitude": -37.8768370254318,
                        "longitude": 145.04427228136458,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407132999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 68.5511474609375,
                        "altitudeAccuracy": 8,
                        "heading": 281.953125,
                        "latitude": -37.876836941612765,
                        "longitude": 145.04425870268145,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407133999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 67.91668701171875,
                        "altitudeAccuracy": 8,
                        "heading": 283.0078125,
                        "latitude": -37.87683585196535,
                        "longitude": 145.0442432799796,
                        "speed": 1.2599999904632568
                    },
                    "timestamp": 1473407134999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 66.569091796875,
                        "altitudeAccuracy": 8,
                        "heading": 283.7109375,
                        "latitude": -37.87683354694198,
                        "longitude": 145.04422509124973,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1473407135999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 67.053955078125,
                        "altitudeAccuracy": 8,
                        "heading": 282.3046875,
                        "latitude": -37.87683048754732,
                        "longitude": 145.04420908181467,
                        "speed": 1.4800000190734863
                    },
                    "timestamp": 1473407136999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 62.9404296875,
                        "altitudeAccuracy": 8,
                        "heading": 281.25,
                        "latitude": -37.87682826634298,
                        "longitude": 145.0441901387135,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1473407137999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 62.68109130859375,
                        "altitudeAccuracy": 8,
                        "heading": 278.7890625,
                        "latitude": -37.87682818252395,
                        "longitude": 145.04417278817394,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1473407138999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 62.1065673828125,
                        "altitudeAccuracy": 8,
                        "heading": 272.8125,
                        "latitude": -37.87682801488589,
                        "longitude": 145.04415434798696,
                        "speed": 1.2999999523162842
                    },
                    "timestamp": 1473407139999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 62.57537841796875,
                        "altitudeAccuracy": 8,
                        "heading": 272.109375,
                        "latitude": -37.87683132573764,
                        "longitude": 145.04413917674222,
                        "speed": 1.25
                    },
                    "timestamp": 1473407140998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 61.62237548828125,
                        "altitudeAccuracy": 8,
                        "heading": 271.7578125,
                        "latitude": -37.87683681588422,
                        "longitude": 145.04412685534456,
                        "speed": 1.159999966621399
                    },
                    "timestamp": 1473407141999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.9512939453125,
                        "altitudeAccuracy": 8,
                        "heading": 271.7578125,
                        "latitude": -37.87684368904482,
                        "longitude": 145.04411654560366,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1473407142999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.80621337890625,
                        "altitudeAccuracy": 8,
                        "heading": 271.40625,
                        "latitude": -37.876850771753,
                        "longitude": 145.04410489475825,
                        "speed": 1.1799999475479126
                    },
                    "timestamp": 1473407143999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.99786376953125,
                        "altitudeAccuracy": 8,
                        "heading": 271.40625,
                        "latitude": -37.8768576449136,
                        "longitude": 145.04409299245575,
                        "speed": 1.1200000047683716
                    },
                    "timestamp": 1473407144999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.8394775390625,
                        "altitudeAccuracy": 8,
                        "heading": 271.40625,
                        "latitude": -37.87686544008355,
                        "longitude": 145.04408167688646,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1473407145998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 57.882080078125,
                        "altitudeAccuracy": 12,
                        "heading": 271.40625,
                        "latitude": -37.87687415726285,
                        "longitude": 145.0440696069459,
                        "speed": 1.090000033378601
                    },
                    "timestamp": 1473407146999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 58.64453125,
                        "altitudeAccuracy": 12,
                        "heading": 271.40625,
                        "latitude": -37.87688199434231,
                        "longitude": 145.04405803991952,
                        "speed": 1.0499999523162842
                    },
                    "timestamp": 1473407147998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.41778564453125,
                        "altitudeAccuracy": 12,
                        "heading": 271.40625,
                        "latitude": -37.87688790358405,
                        "longitude": 145.04404596997895,
                        "speed": 1.0499999523162842
                    },
                    "timestamp": 1473407148998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.369140625,
                        "altitudeAccuracy": 12,
                        "heading": 259.1015625,
                        "latitude": -37.87689213644515,
                        "longitude": 145.0440297090868,
                        "speed": 1.0499999523162842
                    },
                    "timestamp": 1473407149998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.20281982421875,
                        "altitudeAccuracy": 12,
                        "heading": 265.4296875,
                        "latitude": -37.876895321568355,
                        "longitude": 145.04401235854723,
                        "speed": 1.2300000190734863
                    },
                    "timestamp": 1473407150998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 60.00537109375,
                        "altitudeAccuracy": 12,
                        "heading": 265.4296875,
                        "latitude": -37.87689783613931,
                        "longitude": 145.0439971873025,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1473407151999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 59.771728515625,
                        "altitudeAccuracy": 12,
                        "heading": 265.4296875,
                        "latitude": -37.87690093744348,
                        "longitude": 145.04398235133388,
                        "speed": 1.25
                    },
                    "timestamp": 1473407152998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 61.2733154296875,
                        "altitudeAccuracy": 12,
                        "heading": 264.7265625,
                        "latitude": -37.87690558939974,
                        "longitude": 145.04396667717495,
                        "speed": 1.25
                    },
                    "timestamp": 1473407153998
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 61.16302490234375,
                        "altitudeAccuracy": 12,
                        "heading": 264.7265625,
                        "latitude": -37.876907559146986,
                        "longitude": 145.04395687034824,
                        "speed": 1.25
                    },
                    "timestamp": 1473407154999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 61.16876220703125,
                        "altitudeAccuracy": 8,
                        "heading": 264.7265625,
                        "latitude": -37.87690835542779,
                        "longitude": 145.04394982954958,
                        "speed": 0.75
                    },
                    "timestamp": 1473407155999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 60.93408203125,
                        "altitudeAccuracy": 8,
                        "heading": 264.7265625,
                        "latitude": -37.87690517030458,
                        "longitude": 145.0439385139803,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1473407156999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 61.058349609375,
                        "altitudeAccuracy": 8,
                        "heading": 264.7265625,
                        "latitude": -37.876902194728956,
                        "longitude": 145.04392443238297,
                        "speed": 1.0800000429153442
                    },
                    "timestamp": 1473407157999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 60.8515625,
                        "altitudeAccuracy": 8,
                        "heading": 264.7265625,
                        "latitude": -37.8768999316151,
                        "longitude": 145.04391387118497,
                        "speed": 1.0399999618530273
                    },
                    "timestamp": 1473407159000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 62.5040283203125,
                        "altitudeAccuracy": 8,
                        "heading": 264.7265625,
                        "latitude": -37.8768999316151,
                        "longitude": 145.04391387118497,
                        "speed": 0
                    },
                    "timestamp": 1473407160000
                }
            ]
        },
        {
            title: "Mornington Park",
            locations: [
                {
                    "coords": {
                        "accuracy": 65,
                        "altitude": 18.30927276611328,
                        "altitudeAccuracy": 10.975285248753396,
                        "heading": null,
                        "latitude": -38.216828685580936,
                        "longitude": 145.03549284657626,
                        "speed": null
                    },
                    "timestamp": 1474069830316
                },
                {
                    "coords": {
                        "accuracy": 65,
                        "altitude": 18.30927276611328,
                        "altitudeAccuracy": 10.975285248753396,
                        "heading": null,
                        "latitude": -38.216828685580936,
                        "longitude": 145.03549284657626,
                        "speed": null
                    },
                    "timestamp": 1474069825025
                },
                {
                    "coords": {
                        "accuracy": 65,
                        "altitude": 18.30927276611328,
                        "altitudeAccuracy": 10.975285248753396,
                        "heading": null,
                        "latitude": -38.216828685580936,
                        "longitude": 145.03549284657626,
                        "speed": null
                    },
                    "timestamp": 1474069830321
                },
                {
                    "coords": {
                        "accuracy": 65,
                        "altitude": 18.30927276611328,
                        "altitudeAccuracy": 10.975285248753396,
                        "heading": null,
                        "latitude": -38.216828685580936,
                        "longitude": 145.03549284657626,
                        "speed": null
                    },
                    "timestamp": 1474069830321
                },
                {
                    "coords": {
                        "accuracy": 50,
                        "altitude": -6.558197021484375,
                        "altitudeAccuracy": 48,
                        "heading": null,
                        "latitude": -38.21606178305877,
                        "longitude": 145.0356903021643,
                        "speed": 0
                    },
                    "timestamp": 1474069832033
                },
                {
                    "coords": {
                        "accuracy": 30,
                        "altitude": -3.854827880859375,
                        "altitudeAccuracy": 24,
                        "heading": null,
                        "latitude": -38.21606178305877,
                        "longitude": 145.0356903021643,
                        "speed": 0
                    },
                    "timestamp": 1474069833001
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": -1.752288818359375,
                        "altitudeAccuracy": 24,
                        "heading": null,
                        "latitude": -38.21606178305877,
                        "longitude": 145.0356903021643,
                        "speed": 0
                    },
                    "timestamp": 1474069834000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": -0.2728271484375,
                        "altitudeAccuracy": 24,
                        "heading": null,
                        "latitude": -38.21601543113423,
                        "longitude": 145.0356344786892,
                        "speed": 0
                    },
                    "timestamp": 1474069835000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 0.170806884765625,
                        "altitudeAccuracy": 24,
                        "heading": null,
                        "latitude": -38.21601543113423,
                        "longitude": 145.0356344786892,
                        "speed": 0
                    },
                    "timestamp": 1474069836000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 0.439849853515625,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -38.21601543113423,
                        "longitude": 145.0356344786892,
                        "speed": 0
                    },
                    "timestamp": 1474069837000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 0.874603271484375,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -38.21601543113423,
                        "longitude": 145.0356344786892,
                        "speed": 0
                    },
                    "timestamp": 1474069837999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.27484130859375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.215941418929226,
                        "longitude": 145.03557010567283,
                        "speed": 0
                    },
                    "timestamp": 1474069839000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.3109130859375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069840000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.312591552734375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069841000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.319854736328125,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069842000
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.35693359375,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069842999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.39044189453125,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069843999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.434234619140625,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069844999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.52313232421875,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069845999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.5980224609375,
                        "altitudeAccuracy": 16,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069846999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.6949462890625,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069847999
                },
                {
                    "coords": {
                        "accuracy": 10,
                        "altitude": 6.71435546875,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069848999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.737457275390625,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069849999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.771392822265625,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069850999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.8021240234375,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069851999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.852203369140625,
                        "altitudeAccuracy": 12,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069852999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.87396240234375,
                        "altitudeAccuracy": 8,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069853999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.855072021484375,
                        "altitudeAccuracy": 8,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069854999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 2.93988037109375,
                        "altitudeAccuracy": 8,
                        "heading": null,
                        "latitude": -38.21590089242739,
                        "longitude": 145.03553817062175,
                        "speed": 0
                    },
                    "timestamp": 1474069855999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 0.630462646484375,
                        "altitudeAccuracy": 6,
                        "heading": 148.359375,
                        "latitude": -38.21588966067714,
                        "longitude": 145.03552626831924,
                        "speed": 0.7300000190734863
                    },
                    "timestamp": 1474069856999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 0.89453125,
                        "altitudeAccuracy": 6,
                        "heading": 133.59375,
                        "latitude": -38.21591032206846,
                        "longitude": 145.03554797744846,
                        "speed": 1.6399999856948853
                    },
                    "timestamp": 1474069857999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 1.53253173828125,
                        "altitudeAccuracy": 6,
                        "heading": 116.71875,
                        "latitude": -38.2159246970324,
                        "longitude": 145.03557572154796,
                        "speed": 1.6399999856948853
                    },
                    "timestamp": 1474069858999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 3.56317138671875,
                        "altitudeAccuracy": 6,
                        "heading": 92.109375,
                        "latitude": -38.2159305224551,
                        "longitude": 145.03560740514195,
                        "speed": 1.8300000429153442
                    },
                    "timestamp": 1474069859999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 4.62457275390625,
                        "altitudeAccuracy": 6,
                        "heading": 78.75,
                        "latitude": -38.21592222437096,
                        "longitude": 145.0356379152695,
                        "speed": 2.4100000858306885
                    },
                    "timestamp": 1474069860999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 5.722320556640625,
                        "altitudeAccuracy": 4,
                        "heading": 59.0625,
                        "latitude": -38.21589821021838,
                        "longitude": 145.0356733707199,
                        "speed": 3.309999942779541
                    },
                    "timestamp": 1474069861999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 4.67376708984375,
                        "altitudeAccuracy": 4,
                        "heading": 54.4921875,
                        "latitude": -38.21587863847447,
                        "longitude": 145.035705305771,
                        "speed": 3.309999942779541
                    },
                    "timestamp": 1474069862999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 4.813507080078125,
                        "altitudeAccuracy": 4,
                        "heading": 55.1953125,
                        "latitude": -38.215861916577644,
                        "longitude": 145.0357336366037,
                        "speed": 3.2300000190734863
                    },
                    "timestamp": 1474069863999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 5.06640625,
                        "altitudeAccuracy": 4,
                        "heading": 56.25,
                        "latitude": -38.215847038699515,
                        "longitude": 145.0357600395987,
                        "speed": 2.9100000858306885
                    },
                    "timestamp": 1474069864999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 4.98394775390625,
                        "altitudeAccuracy": 4,
                        "heading": 60.8203125,
                        "latitude": -38.21583211891187,
                        "longitude": 145.03578476621306,
                        "speed": 2.740000009536743
                    },
                    "timestamp": 1474069865999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 5.6805419921875,
                        "altitudeAccuracy": 4,
                        "heading": 63.984375,
                        "latitude": -38.21581858213825,
                        "longitude": 145.0358099957416,
                        "speed": 2.7300000190734863
                    },
                    "timestamp": 1474069866999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.38848876953125,
                        "altitudeAccuracy": 4,
                        "heading": 61.171875,
                        "latitude": -38.21580592546446,
                        "longitude": 145.03583706928885,
                        "speed": 2.740000009536743
                    },
                    "timestamp": 1474069867999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 6.668487548828125,
                        "altitudeAccuracy": 4,
                        "heading": 51.6796875,
                        "latitude": -38.21579708255661,
                        "longitude": 145.03585559329485,
                        "speed": 2.7300000190734863
                    },
                    "timestamp": 1474069868999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 8.05535888671875,
                        "altitudeAccuracy": 4,
                        "heading": 39.7265625,
                        "latitude": -38.215792011505194,
                        "longitude": 145.03586238263642,
                        "speed": 1.4199999570846558
                    },
                    "timestamp": 1474069869999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 8.177459716796875,
                        "altitudeAccuracy": 4,
                        "heading": 9.140625,
                        "latitude": -38.215792011505194,
                        "longitude": 145.03586238263642,
                        "speed": 0
                    },
                    "timestamp": 1474069870999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 8.366180419921875,
                        "altitudeAccuracy": 4,
                        "heading": 24.2578125,
                        "latitude": -38.215792011505194,
                        "longitude": 145.03586238263642,
                        "speed": 0
                    },
                    "timestamp": 1474069871999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 8.646820068359375,
                        "altitudeAccuracy": 6,
                        "heading": 2.4609375,
                        "latitude": -38.21578291714025,
                        "longitude": 145.03586079007482,
                        "speed": 0.8500000238418579
                    },
                    "timestamp": 1474069872999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 9.22088623046875,
                        "altitudeAccuracy": 4,
                        "heading": 356.1328125,
                        "latitude": -38.21576158519668,
                        "longitude": 145.0358591136942,
                        "speed": 0.8500000238418579
                    },
                    "timestamp": 1474069873999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 10.89239501953125,
                        "altitudeAccuracy": 4,
                        "heading": 355.78125,
                        "latitude": -38.21573015305979,
                        "longitude": 145.0358549227426,
                        "speed": 2.759999990463257
                    },
                    "timestamp": 1474069874999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.49609375,
                        "altitudeAccuracy": 4,
                        "heading": 351.2109375,
                        "latitude": -38.21569842755628,
                        "longitude": 145.0358485524962,
                        "speed": 3.0999999046325684
                    },
                    "timestamp": 1474069875999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.7020263671875,
                        "altitudeAccuracy": 4,
                        "heading": 355.078125,
                        "latitude": -38.21567738897932,
                        "longitude": 145.03584293662107,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1474069876999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.77850341796875,
                        "altitudeAccuracy": 4,
                        "heading": 355.078125,
                        "latitude": -38.21566477421505,
                        "longitude": 145.0358393324027,
                        "speed": 1.2799999713897705
                    },
                    "timestamp": 1474069877999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.3944091796875,
                        "altitudeAccuracy": 4,
                        "heading": 351.2109375,
                        "latitude": -38.21565215945078,
                        "longitude": 145.0358361472795,
                        "speed": 1.2699999809265137
                    },
                    "timestamp": 1474069878999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.2576904296875,
                        "altitudeAccuracy": 4,
                        "heading": 18.6328125,
                        "latitude": -38.21564067624343,
                        "longitude": 145.03583899712658,
                        "speed": 1.2400000095367432
                    },
                    "timestamp": 1474069879999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.3646240234375,
                        "altitudeAccuracy": 4,
                        "heading": 35.5078125,
                        "latitude": -38.215635186096854,
                        "longitude": 145.03584469682073,
                        "speed": 0.3499999940395355
                    },
                    "timestamp": 1474069880999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.17523193359375,
                        "altitudeAccuracy": 4,
                        "heading": 341.3671875,
                        "latitude": -38.215633970720894,
                        "longitude": 145.03584771430587,
                        "speed": 0.5199999809265137
                    },
                    "timestamp": 1474069881999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 10.941192626953125,
                        "altitudeAccuracy": 3,
                        "heading": 317.109375,
                        "latitude": -38.21562169123275,
                        "longitude": 145.03583866185045,
                        "speed": 0.5199999809265137
                    },
                    "timestamp": 1474069882999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 10.413909912109375,
                        "altitudeAccuracy": 3,
                        "heading": 319.5703125,
                        "latitude": -38.2156009460224,
                        "longitude": 145.0358150248835,
                        "speed": 2.5299999713897705
                    },
                    "timestamp": 1474069883999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.4676513671875,
                        "altitudeAccuracy": 4,
                        "heading": 317.8125,
                        "latitude": -38.215581248549945,
                        "longitude": 145.03578677786982,
                        "speed": 3.0399999618530273
                    },
                    "timestamp": 1474069884999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.3896484375,
                        "altitudeAccuracy": 4,
                        "heading": 316.40625,
                        "latitude": -38.215563856100864,
                        "longitude": 145.03576045869386,
                        "speed": 2.759999990463257
                    },
                    "timestamp": 1474069885999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.4324951171875,
                        "altitudeAccuracy": 4,
                        "heading": 314.6484375,
                        "latitude": -38.21555065460337,
                        "longitude": 145.03573883338368,
                        "speed": 2.759999990463257
                    },
                    "timestamp": 1474069886999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.00213623046875,
                        "altitudeAccuracy": 4,
                        "heading": 328.0078125,
                        "latitude": -38.21554445199502,
                        "longitude": 145.0357240812341,
                        "speed": 2.0999999046325684
                    },
                    "timestamp": 1474069887999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.7987060546875,
                        "altitudeAccuracy": 4,
                        "heading": 319.5703125,
                        "latitude": -38.21554445199502,
                        "longitude": 145.0357240812341,
                        "speed": 0
                    },
                    "timestamp": 1474069888999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.1402587890625,
                        "altitudeAccuracy": 3,
                        "heading": 317.109375,
                        "latitude": -38.21554445199502,
                        "longitude": 145.0357240812341,
                        "speed": 0
                    },
                    "timestamp": 1474069889999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.0069580078125,
                        "altitudeAccuracy": 3,
                        "heading": 273.1640625,
                        "latitude": -38.21555086415095,
                        "longitude": 145.03571528023576,
                        "speed": 0.25
                    },
                    "timestamp": 1474069890999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.14202880859375,
                        "altitudeAccuracy": 3,
                        "heading": 298.828125,
                        "latitude": -38.21554784666581,
                        "longitude": 145.0356992708007,
                        "speed": 2.049999952316284
                    },
                    "timestamp": 1474069891999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.235595703125,
                        "altitudeAccuracy": 3,
                        "heading": 296.3671875,
                        "latitude": -38.21553904566748,
                        "longitude": 145.0356701855967,
                        "speed": 2.049999952316284
                    },
                    "timestamp": 1474069892999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.8533935546875,
                        "altitudeAccuracy": 3,
                        "heading": 296.3671875,
                        "latitude": -38.21552789773626,
                        "longitude": 145.0356355683366,
                        "speed": 2.799999952316284
                    },
                    "timestamp": 1474069893999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.91217041015625,
                        "altitudeAccuracy": 3,
                        "heading": 296.015625,
                        "latitude": -38.21551616307182,
                        "longitude": 145.03560061580038,
                        "speed": 3.0299999713897705
                    },
                    "timestamp": 1474069894999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.58758544921875,
                        "altitudeAccuracy": 3,
                        "heading": 299.1796875,
                        "latitude": -38.215505559964306,
                        "longitude": 145.03557094386315,
                        "speed": 2.309999942779541
                    },
                    "timestamp": 1474069895999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.5201416015625,
                        "altitudeAccuracy": 3,
                        "heading": 301.2890625,
                        "latitude": -38.215500405093856,
                        "longitude": 145.0355551858852,
                        "speed": 2.309999942779541
                    },
                    "timestamp": 1474069896999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.78729248046875,
                        "altitudeAccuracy": 3,
                        "heading": 301.9921875,
                        "latitude": -38.215500405093856,
                        "longitude": 145.0355551858852,
                        "speed": 0
                    },
                    "timestamp": 1474069897999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.48004150390625,
                        "altitudeAccuracy": 3,
                        "heading": 272.8125,
                        "latitude": -38.21550120137466,
                        "longitude": 145.0355525874952,
                        "speed": 0.17000000178813934
                    },
                    "timestamp": 1474069898999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.39208984375,
                        "altitudeAccuracy": 3,
                        "heading": 293.203125,
                        "latitude": -38.21549977645112,
                        "longitude": 145.03554479232525,
                        "speed": 0.17000000178813934
                    },
                    "timestamp": 1474069899999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.547607421875,
                        "altitudeAccuracy": 3,
                        "heading": 274.921875,
                        "latitude": -38.2154973456992,
                        "longitude": 145.03552358611023,
                        "speed": 2.180000066757202
                    },
                    "timestamp": 1474069900999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.7681884765625,
                        "altitudeAccuracy": 3,
                        "heading": 285.1171875,
                        "latitude": -38.21549491494728,
                        "longitude": 145.03550061969554,
                        "speed": 2.180000066757202
                    },
                    "timestamp": 1474069901999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.95989990234375,
                        "altitudeAccuracy": 3,
                        "heading": 280.8984375,
                        "latitude": -38.21549147836698,
                        "longitude": 145.03547228886282,
                        "speed": 2.180000066757202
                    },
                    "timestamp": 1474069902999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 11.9530029296875,
                        "altitudeAccuracy": 3,
                        "heading": 278.0859375,
                        "latitude": -38.21548833515329,
                        "longitude": 145.0354325586418,
                        "speed": 2.75
                    },
                    "timestamp": 1474069903999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.18817138671875,
                        "altitudeAccuracy": 3,
                        "heading": 274.21875,
                        "latitude": -38.2154867845012,
                        "longitude": 145.0353892242024,
                        "speed": 3.4700000286102295
                    },
                    "timestamp": 1474069904999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 12.67376708984375,
                        "altitudeAccuracy": 3,
                        "heading": 263.3203125,
                        "latitude": -38.215489089524574,
                        "longitude": 145.03535259528553,
                        "speed": 2.5399999618530273
                    },
                    "timestamp": 1474069905999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.10833740234375,
                        "altitudeAccuracy": 3,
                        "heading": 261.9140625,
                        "latitude": -38.21549227464778,
                        "longitude": 145.03533314927017,
                        "speed": 2.5399999618530273
                    },
                    "timestamp": 1474069906999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.70660400390625,
                        "altitudeAccuracy": 3,
                        "heading": 267.890625,
                        "latitude": -38.21549432821406,
                        "longitude": 145.03532786867117,
                        "speed": 0.9800000190734863
                    },
                    "timestamp": 1474069907999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.651123046875,
                        "altitudeAccuracy": 3,
                        "heading": 254.1796875,
                        "latitude": -38.215496675146944,
                        "longitude": 145.03532694666183,
                        "speed": 0.36000001430511475
                    },
                    "timestamp": 1474069908999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.6854248046875,
                        "altitudeAccuracy": 3,
                        "heading": 266.1328125,
                        "latitude": -38.21549931544644,
                        "longitude": 145.03531160777902,
                        "speed": 0.36000001430511475
                    },
                    "timestamp": 1474069909999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.64337158203125,
                        "altitudeAccuracy": 3,
                        "heading": 258.3984375,
                        "latitude": -38.21550438649786,
                        "longitude": 145.03528201966083,
                        "speed": 2.6600000858306885
                    },
                    "timestamp": 1474069910999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.71221923828125,
                        "altitudeAccuracy": 3,
                        "heading": 265.4296875,
                        "latitude": -38.21550882890654,
                        "longitude": 145.03525888560807,
                        "speed": 2.6600000858306885
                    },
                    "timestamp": 1474069911999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.53656005859375,
                        "altitudeAccuracy": 3,
                        "heading": 275.625,
                        "latitude": -38.21551151111556,
                        "longitude": 145.03524849204814,
                        "speed": 1.3300000429153442
                    },
                    "timestamp": 1474069912999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.41119384765625,
                        "altitudeAccuracy": 3,
                        "heading": 230.2734375,
                        "latitude": -38.21551381613893,
                        "longitude": 145.035245474563,
                        "speed": 0.20999999344348907
                    },
                    "timestamp": 1474069913999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.22412109375,
                        "altitudeAccuracy": 3,
                        "heading": 228.1640625,
                        "latitude": -38.21552102457566,
                        "longitude": 145.03523851758337,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1474069914999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 13.84124755859375,
                        "altitudeAccuracy": 3,
                        "heading": 212.34375,
                        "latitude": -38.21553711782975,
                        "longitude": 145.03522451980507,
                        "speed": 2.430000066757202
                    },
                    "timestamp": 1474069915999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.6632080078125,
                        "altitudeAccuracy": 3,
                        "heading": 209.1796875,
                        "latitude": -38.21555815640671,
                        "longitude": 145.03520892946517,
                        "speed": 2.309999942779541
                    },
                    "timestamp": 1474069916999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.31494140625,
                        "altitudeAccuracy": 3,
                        "heading": 200.7421875,
                        "latitude": -38.215574082022734,
                        "longitude": 145.03519996082878,
                        "speed": 2.309999942779541
                    },
                    "timestamp": 1474069917999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.4974365234375,
                        "altitudeAccuracy": 3,
                        "heading": 190.1953125,
                        "latitude": -38.215582757292516,
                        "longitude": 145.03519836826717,
                        "speed": 1.3200000524520874
                    },
                    "timestamp": 1474069918999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.4580078125,
                        "altitudeAccuracy": 3,
                        "heading": 191.6015625,
                        "latitude": -38.215582757292516,
                        "longitude": 145.03519836826717,
                        "speed": 0
                    },
                    "timestamp": 1474069919999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.44573974609375,
                        "altitudeAccuracy": 3,
                        "heading": 169.453125,
                        "latitude": -38.215588750353284,
                        "longitude": 145.0352023915807,
                        "speed": 0.38999998569488525
                    },
                    "timestamp": 1474069920999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.4876708984375,
                        "altitudeAccuracy": 3,
                        "heading": 164.8828125,
                        "latitude": -38.21559851527048,
                        "longitude": 145.03520708544647,
                        "speed": 0.38999998569488525
                    },
                    "timestamp": 1474069921999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.58648681640625,
                        "altitudeAccuracy": 3,
                        "heading": 160.6640625,
                        "latitude": -38.215616871638424,
                        "longitude": 145.03521764664447,
                        "speed": 1.440000057220459
                    },
                    "timestamp": 1474069922999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.11578369140625,
                        "altitudeAccuracy": 3,
                        "heading": 152.2265625,
                        "latitude": -38.215640550514884,
                        "longitude": 145.03523826612627,
                        "speed": 3.130000114440918
                    },
                    "timestamp": 1474069923999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.22576904296875,
                        "altitudeAccuracy": 3,
                        "heading": 147.3046875,
                        "latitude": -38.21566670205278,
                        "longitude": 145.0352650043974,
                        "speed": 3.2699999809265137
                    },
                    "timestamp": 1474069924999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.2408447265625,
                        "altitudeAccuracy": 3,
                        "heading": 143.7890625,
                        "latitude": -38.21569226685745,
                        "longitude": 145.03529526306784,
                        "speed": 3.2300000190734863
                    },
                    "timestamp": 1474069925999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.58807373046875,
                        "altitudeAccuracy": 3,
                        "heading": 141.328125,
                        "latitude": -38.215716113371975,
                        "longitude": 145.03532694666183,
                        "speed": 3.2699999809265137
                    },
                    "timestamp": 1474069926999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.85101318359375,
                        "altitudeAccuracy": 3,
                        "heading": 137.4609375,
                        "latitude": -38.21574042089117,
                        "longitude": 145.0353596360842,
                        "speed": 3.3499999046325684
                    },
                    "timestamp": 1474069927999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 14.9677734375,
                        "altitudeAccuracy": 3,
                        "heading": 136.7578125,
                        "latitude": -38.215765901876814,
                        "longitude": 145.03539358279204,
                        "speed": 3.799999952316284
                    },
                    "timestamp": 1474069928999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.17474365234375,
                        "altitudeAccuracy": 3,
                        "heading": 138.8671875,
                        "latitude": -38.21579025130553,
                        "longitude": 145.03542484729087,
                        "speed": 3.799999952316284
                    },
                    "timestamp": 1474069929999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.7626953125,
                        "altitudeAccuracy": 3,
                        "heading": 143.0859375,
                        "latitude": -38.21581321772022,
                        "longitude": 145.0354510826478,
                        "speed": 3.5299999713897705
                    },
                    "timestamp": 1474069930999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.39129638671875,
                        "altitudeAccuracy": 3,
                        "heading": 145.1953125,
                        "latitude": -38.21583685468716,
                        "longitude": 145.03547480343377,
                        "speed": 3.240000009536743
                    },
                    "timestamp": 1474069931999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.94378662109375,
                        "altitudeAccuracy": 3,
                        "heading": 144.4921875,
                        "latitude": -38.21586183275861,
                        "longitude": 145.03549902713394,
                        "speed": 3.319999933242798
                    },
                    "timestamp": 1474069932999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.76776123046875,
                        "altitudeAccuracy": 3,
                        "heading": 140.9765625,
                        "latitude": -38.215883164702184,
                        "longitude": 145.03552291555798,
                        "speed": 3.319999933242798
                    },
                    "timestamp": 1474069933999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.96185302734375,
                        "altitudeAccuracy": 3,
                        "heading": 136.0546875,
                        "latitude": -38.21590068287981,
                        "longitude": 145.03554655252492,
                        "speed": 2.7300000190734863
                    },
                    "timestamp": 1474069934999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.76544189453125,
                        "altitudeAccuracy": 3,
                        "heading": 138.515625,
                        "latitude": -38.21591660849584,
                        "longitude": 145.03556700436866,
                        "speed": 2.6700000762939453
                    },
                    "timestamp": 1474069935999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.115966796875,
                        "altitudeAccuracy": 3,
                        "heading": 131.1328125,
                        "latitude": -38.21592872034592,
                        "longitude": 145.03558418727016,
                        "speed": 2.119999885559082
                    },
                    "timestamp": 1474069936999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.9415283203125,
                        "altitudeAccuracy": 3,
                        "heading": 134.296875,
                        "latitude": -38.21593731179667,
                        "longitude": 145.03559759831523,
                        "speed": 1.3300000429153442
                    },
                    "timestamp": 1474069937999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.85009765625,
                        "altitudeAccuracy": 3,
                        "heading": 137.109375,
                        "latitude": -38.21594338867647,
                        "longitude": 145.03560681840872,
                        "speed": 1.3300000429153442
                    },
                    "timestamp": 1474069938999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.195556640625,
                        "altitudeAccuracy": 3,
                        "heading": 124.1015625,
                        "latitude": -38.21594833399934,
                        "longitude": 145.03561503267383,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1474069939999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.93084716796875,
                        "altitudeAccuracy": 3,
                        "heading": 133.9453125,
                        "latitude": -38.21595663208348,
                        "longitude": 145.03562827608084,
                        "speed": 1.0700000524520874
                    },
                    "timestamp": 1474069940999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.1468505859375,
                        "altitudeAccuracy": 3,
                        "heading": 136.40625,
                        "latitude": -38.215967947652764,
                        "longitude": 145.03564395023977,
                        "speed": 1.690000057220459
                    },
                    "timestamp": 1474069941999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.95928955078125,
                        "altitudeAccuracy": 3,
                        "heading": 162.0703125,
                        "latitude": -38.21598064623607,
                        "longitude": 145.03565635545647,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1474069942999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.79217529296875,
                        "altitudeAccuracy": 3,
                        "heading": 187.734375,
                        "latitude": -38.21599489547146,
                        "longitude": 145.03566255806481,
                        "speed": 1.600000023841858
                    },
                    "timestamp": 1474069943999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 15.97021484375,
                        "altitudeAccuracy": 3,
                        "heading": 235.546875,
                        "latitude": -38.21600591767413,
                        "longitude": 145.03566029495096,
                        "speed": 1.5499999523162842
                    },
                    "timestamp": 1474069944999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.599853515625,
                        "altitudeAccuracy": 3,
                        "heading": 305.15625,
                        "latitude": -38.21600868370218,
                        "longitude": 145.03565317033326,
                        "speed": 1.0299999713897705
                    },
                    "timestamp": 1474069945999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.660400390625,
                        "altitudeAccuracy": 3,
                        "heading": 343.125,
                        "latitude": -38.21600419938398,
                        "longitude": 145.03564361496365,
                        "speed": 0.9700000286102295
                    },
                    "timestamp": 1474069946999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.7061767578125,
                        "altitudeAccuracy": 3,
                        "heading": 332.578125,
                        "latitude": -38.215994560195334,
                        "longitude": 145.03563405959403,
                        "speed": 0.949999988079071
                    },
                    "timestamp": 1474069947999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.6446533203125,
                        "altitudeAccuracy": 3,
                        "heading": 346.2890625,
                        "latitude": -38.21598395708782,
                        "longitude": 145.03562861135697,
                        "speed": 0.949999988079071
                    },
                    "timestamp": 1474069948999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.4156494140625,
                        "altitudeAccuracy": 3,
                        "heading": 332.2265625,
                        "latitude": -38.21597591046078,
                        "longitude": 145.03562450422442,
                        "speed": 0.8100000023841858
                    },
                    "timestamp": 1474069949999
                },
                {
                    "coords": {
                        "accuracy": 5,
                        "altitude": 16.21551513671875,
                        "altitudeAccuracy": 3,
                        "heading": 322.734375,
                        "latitude": -38.21596928875727,
                        "longitude": 145.03562039709186,
                        "speed": 0.5600000023841858
                    },
                    "timestamp": 1474069950999
                }
            ]
        },
    ];

    // Finally, initialise class
    initialise();
}
