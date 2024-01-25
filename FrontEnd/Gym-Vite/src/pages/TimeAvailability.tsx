import * as React from 'react';
import {useState} from 'react';
import {Modal, Spinner, Toast} from 'react-bootstrap';
import '../styles/TimeAvailability.css';

interface Timeslot {
    date: string;
    startTime: string;
    endTime: string;
}

const DayComponent: React.FC<{
    day: Date;
    selected: boolean;
    onDayClick: () => void;
    onTimeChange: (field: 'startTime' | 'endTime', value: string) => void;
    onAddTimeslot: () => void;
    timeslot: Timeslot | undefined;
}> = ({day, selected, onDayClick, onTimeChange, onAddTimeslot, timeslot}) => {
    const formattedDate = day.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });

    return (
        <div className={`day-component ${selected ? 'active' : ''}`} onClick={onDayClick}>
            <h5>{`${formattedDate}`}</h5>
            <div className="mb-3">
                <label htmlFor="startTime" className="form-label">
                    Start Time
                </label>
                <input
                    type="time"
                    className="form-control"
                    id="startTime"
                    value={timeslot?.startTime || ''}
                    onChange={(e) => onTimeChange('startTime', e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="endTime" className="form-label">
                    End Time
                </label>
                <input
                    type="time"
                    className="form-control"
                    id="endTime"
                    value={timeslot?.endTime || ''}
                    onChange={(e) => onTimeChange('endTime', e.target.value)}
                    required
                />
            </div>
            <div className="mb-3 text-center">
                <button type="button" className="btn btn-secondary" onClick={onAddTimeslot}>
                    Add Timeslot
                </button>
            </div>
        </div>
    );
};
const CustomAlert: React.FC<{ show: boolean; onClose: () => void; message: string }> = ({
                                                                                            show,
                                                                                            onClose,
                                                                                            message,
                                                                                        }) => {
    return (
        <div
            className={`custom-alert ${show ? 'show' : ''}`}
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'rgba(255, 0, 0, 0.8)', // Red background for warning
                color: '#fff',
                padding: '10px',
                cursor: 'pointer',
                display: show ? 'block' : 'none',
            }}
            onClick={onClose}
        >
            <strong>{message}</strong>
        </div>
    );
};


const TimeAvailability: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
    const [pendingTimeslots, setPendingTimeslots] = useState<Timeslot[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);

    const [showWarning, setShowWarning] = useState<boolean>(false);

    const handleShowWarning = () => {
        setShowWarning(true);

        // Hide the warning after a delay (e.g., 2000 milliseconds)
        setTimeout(() => {
            setShowWarning(false);
        }, 5000);
    };

    const handleDayClick = (dayIndex: number) => {
        setSelectedDay(dayIndex);
    };


    const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
        setTimeslots((prevTimeslots) => {
            const updatedTimeslots = [...prevTimeslots];
            const existingSlot = updatedTimeslots[selectedDay];

            if (existingSlot) {
                updatedTimeslots[selectedDay] = {
                    ...existingSlot,
                    [field]: value || '00:00:00',
                };
            } else {
                const selectedDate = remainingDays[selectedDay].toISOString().split('T')[0];

                updatedTimeslots[selectedDay] = {
                    date: selectedDate,
                    startTime: field === 'startTime' ? value || '00:00:00' : '',
                    endTime: field === 'endTime' ? value || '00:00:00' : '',
                };
            }

            return updatedTimeslots;
        });
    };


    const isOverlapTimeslot = (newTimeslot: Timeslot) => {
        return pendingTimeslots.some(
            (existingTimeslot) =>
                existingTimeslot.date === newTimeslot.date &&
                (
                    (existingTimeslot.startTime <= newTimeslot.startTime && newTimeslot.startTime < existingTimeslot.endTime) ||
                    (existingTimeslot.startTime < newTimeslot.endTime && newTimeslot.endTime <= existingTimeslot.endTime) ||
                    (newTimeslot.startTime <= existingTimeslot.startTime && existingTimeslot.endTime <= newTimeslot.endTime)
                )
        );
    };


    const isDuplicateTimeslot = (newTimeslot: Timeslot) => {
        return pendingTimeslots.some(
            (existingTimeslot) =>
                existingTimeslot.date === newTimeslot.date &&
                existingTimeslot.startTime === newTimeslot.startTime &&
                existingTimeslot.endTime === newTimeslot.endTime
        );
    };

    const handleAddTimeslot = () => {
        const newTimeslot = timeslots[selectedDay];

        if (newTimeslot && !isDuplicateTimeslot(newTimeslot) && !isOverlapTimeslot(newTimeslot)) {
            setPendingTimeslots((prevPendingTimeslots) => [...prevPendingTimeslots, newTimeslot]);
            setShowToast(true);

            // Clear input slots for start time and end time
            setTimeslots((prevTimeslots) => {
                const updatedTimeslots = [...prevTimeslots];
                updatedTimeslots[selectedDay] = {
                    date: newTimeslot.date,
                    startTime: '',
                    endTime: '',
                };
                return updatedTimeslots;
            });
        } else {
            // Display error message for duplicate or overlapping timeslot
            handleShowWarning();
        }
    };

    const handleSubmit = async () => {
        // Format the pendingTimeslots array
        const formattedPendingTimeslots = pendingTimeslots.map((slot) => ({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        // Create an object with the "timeslots" property
        const requestBody = {
            timeslots: formattedPendingTimeslots,
        };
        console.log(requestBody);

        const token = localStorage.getItem('token');

        const response = await fetch('https://gymmate.pythonanywhere.com/backgpt/available', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify(requestBody),
        });

        // Handle response as needed
        if (response.ok) {
            console.log('Availability submitted successfully!');
        } else {
            console.error('Error submitting availability.');
        }

        // Perform fetch with pendingTimeslots
        setLoading(true);



        fetchPlan();
        // Example navigation to the next screen
        // window.location.href = '/schedule';
    };


    const fetchPlan = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('https://gymmate.pythonanywhere.com/backgpt/plan', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.status === 200) {
                // Redirect to the root path
                window.location.href = '/';
            } else {
                console.error('Fetch did not return a 200 status');
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    // const shouldShowNextWeekAvailability = () => {
    //   const today = new Date();
    //   return today.getDay() === 0 && today.getHours() >= 20;
    // };

    const remainingDays = Array.from({length: 7}, (_, index) => {
        const day = new Date();
        day.setDate(day.getDate() + index + (1 - day.getDay()) % 7);
        return day;
    }).filter((day) => day >= new Date());

    return (
        <div className="container mt-4">
            <h3 className="header">Input availability until Sunday:</h3>
            <div className="days-container">
                {remainingDays.map((day, index) => (
                    <DayComponent
                        key={index}
                        day={day}
                        selected={selectedDay === index}
                        onDayClick={() => handleDayClick(index)}
                        onTimeChange={handleTimeChange}
                        onAddTimeslot={handleAddTimeslot}
                        timeslot={timeslots[index]}
                    />
                ))}
            </div>

            <div className="mb-4">
                {/* Add your UI elements for inputting availability for the next week here */}
            </div>
            <>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                    Submit for the week
                </button>
                <Modal show={loading} backdrop="static" keyboard={false}>
                    <Modal.Body className="text-center">
                        <Spinner animation="border" variant="primary"/>
                        <p>Loading...</p>
                    </Modal.Body>
                </Modal>

                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={2000}
                    autohide
                    style={{
                        position: 'fixed', // Change 'absolute' to 'fixed'
                        top: 0,
                        right: 0,
                        width: '100%', // Set width to 100%
                        maxWidth: '100%',
                    }}
                >
                    <Toast.Header>
                        <strong className="mr-auto">Success!</strong>
                    </Toast.Header>
                    <Toast.Body>Timeslot submitted.</Toast.Body>
                </Toast>
            </>
            <CustomAlert
                show={showWarning}
                onClose={() => setShowWarning(false)}
                message="Empty or overlapping timeslot. Please choose different time."
            />
            {/* <BottomNavBar /> */}
        </div>
    );
};

export default TimeAvailability;
