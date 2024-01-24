import * as React from "react";
import { useState, useEffect } from "react";
import BottomNavBar from "../components/BottomNavBar.tsx";
import "../styles/TimetableContainer.css";
import {useNavigate} from "react-router-dom";

interface Exercise {
    name: string;
    repetitions: number;
    sets: number;
}

interface Training {
    done: boolean;
    exercises: Exercise[];
    goal: string;
    training_end: string;
    training_id: number;
    training_start: string;
}

const TimetableContainer: React.FC = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [trainingToDelete, setTrainingToDelete] = useState<number | null>(
        null
    );
    const [trainingToEdit, setTrainingToEdit] = useState<number | null>(null);
    const [newStartTime, setNewStartTime] = useState<string>("");
    const [newEndTime, setNewEndTime] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTimetable = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Token not found");
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(
                    "https://gymmate.pythonanywhere.com/api/getUserTrainings",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch timetable");
                }

                const data = await response.json();
                setTrainings(data.trainings);
            } catch (error) {
                setTrainings([]);
            }
        };

        fetchTimetable();
    }, []);

    const handleDelete = (trainingId: number) => {
        setTrainingToDelete(trainingId);
        setShowDeleteModal(true);
    };

    const handleEdit = (trainingId: number) => {
        setTrainingToEdit(trainingId);
        setShowEditModal(true);
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem("token");

        if (!token || !trainingToDelete) {
            setError("Token or training ID not found");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(
                "https://gymmate.pythonanywhere.com/backgpt/training/delete",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        trainingId: trainingToDelete,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete training");
            }

            setTrainings((prevTrainings) =>
                prevTrainings.filter(
                    (training) => training.training_id !== trainingToDelete
                )
            );
            setShowDeleteModal(false);
        } catch (error) {
            setError("Error deleting training");
        }
    };

    const handleComplete = async (trainingId: number) => {
    const token = localStorage.getItem("token");

    if (!token || !trainingId) {
      setError("Token or training ID not found");
      return;
    }

    try {
      const response = await fetch(
        "https://gymmate.pythonanywhere.com/api/setTrainingDone",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            training_id: trainingId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark training as done");
      }

      // Update the local state to mark the training as done
      setTrainings((prevTrainings) =>
      prevTrainings.map((training) =>
        training.training_id === trainingId
          ? { ...training, done: !training.done }
          : training
      )
    );
    } catch (error) {
      setError("Error marking training as done");
    }
  };

    const convertDateFormat = (inputDate: string) => {
        const parsedDate = new Date(inputDate);
        if (isNaN(parsedDate.getTime())) {
            console.error("Invalid date format:", inputDate);
            return null;
        }
        return `${parsedDate.getFullYear()}-${padZero(
            parsedDate.getMonth() + 1
        )}-${padZero(parsedDate.getDate())} ${padZero(
            parsedDate.getHours()
        )}:${padZero(parsedDate.getMinutes())}:${padZero(
            parsedDate.getSeconds()
        )}`;
    };

    const formatTime = (dateTimeString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            hour: "numeric",
            minute: "numeric",
        };

        const formattedDate = new Date(dateTimeString).toLocaleString(
            "en-US",
            options
        );
        return formattedDate;
    };

    const formatWeekday = (dateTimeString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
        };

        const formattedDate = new Date(dateTimeString).toLocaleString(
            "en-US",
            options
        );
        return formattedDate;
    };



    const padZero = (number: number) => {
        return number < 10 ? `0${number}` : number;
    };

    const confirmEdit = async () => {
        const token = localStorage.getItem("token");

        if (!token || !trainingToEdit || !newStartTime || !newEndTime) {
            setError("Token, training ID, or new times not found");
            return;
        }

        const formattedStartTime = convertDateFormat(newStartTime);
        const formattedEndTime = convertDateFormat(newEndTime);

        try {
            const response = await fetch(
                "https://gymmate.pythonanywhere.com/backgpt/edit",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        trainingId: trainingToEdit,
                        newStartTime: formattedStartTime,
                        newEndTime: formattedEndTime,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to edit training time");
            }

            setShowEditModal(false);
        } catch (error) {
            setError("Error editing training time");
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setTrainingToDelete(null);
    };

    const handleNext    = () =>{
        navigate("/next")
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setTrainingToEdit(null);
        setNewStartTime("");
        setNewEndTime("");
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (trainings.length === 0) {
        const handleAddButtonClick = () => {
            window.location.href = "/availability";
        };

        return (
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
                <div>
                    <h1 style={{ color: "white", fontWeight: "bold" }}>
                        Your Timetable
                    </h1>
                </div>
                <div className="empty-card">
                    <p>Looks like you don't have any trainings yet...</p>
                    <button
                        className="card-button"
                        onClick={handleAddButtonClick}
                    >
                        Add them here
                    </button>
                </div>
                <BottomNavBar />
            </div>
        );
    }

    return (
        <div className="timetable-container min-vh-100">
            <h1 className="timetable-title">Your Timetable <button className="card-button-next" onClick={handleNext}> Next week </button></h1>
            {trainings.map((training) => (
                <div  className={`training-card ${training.done ? 'completed' : ''}`} key={training.training_id}>
                    <div className="card-heading">
                        <h2 className="card-title">
                            {formatWeekday(training.training_start)} training
                        </h2>
                        <div className="card-time">
                            <span>
                                {formatTime(training.training_start)} -{" "}
                                {formatTime(training.training_end)}
                            </span>
                        </div>
                    </div>
                    <h3>{training.goal}</h3>

                    <div className="card-training">
                        <div className="card-training-exercises">
                            {training.exercises.map((exercise, index) => (
                                <div
                                    className="card-training-exercise"
                                    key={index}
                                >
                                    <span className="card-training-exercise-name">
                                        {exercise.name}
                                    </span>
                                    <span>
                                        {exercise.sets} X {exercise.repetitions}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="buttons">
                        <button
                            className="card-button-complete"
                            onClick={() => handleComplete(training.training_id)}

                        >
                             {training.done ? 'Incomplete' : 'Complete'}
                        </button>
                        <button
                            className="card-button"
                            onClick={() => handleEdit(training.training_id)}
                        >
                            Edit
                        </button>
                        <button
                            className="card-button button-delete"
                            onClick={() => handleDelete(training.training_id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
            {showDeleteModal && (
                <div className="modal-backdrop">
                    <div className="training-modal">

                        <h2 className="edit-title">Confirm Delete</h2>
						<div>Are you sure you want to delete this training?</div>
						<div className="buttons">
							<button className="card-button" onClick={handleCloseDeleteModal}>Cancel</button>
							<button className="card-button button-delete" onClick={confirmDelete}>Delete</button>
						</div>
					</div>
                </div>
            )}
            {showEditModal && (
                <div className="modal-backdrop">
                    <div className="training-modal">
                        <h2 className="edit-title">Edit Training Time</h2>
                        <div>
                            <form className="edit-time-container">
                                <input
                                    type="datetime-local"
                                    value={newStartTime}
                                    onChange={(e) =>
                                        setNewStartTime(e.target.value)
                                    }
                                    style={{ width: "100%" }}
                                />
                                <input
                                    type="datetime-local"
                                    value={newEndTime}
                                    onChange={(e) =>
                                        setNewEndTime(e.target.value)
                                    }
                                    style={{ width: "100%" }}
                                />
                            </form>
                        </div>
                        <div className="buttons">
                            <button
                                className="card-button"
                                onClick={handleCloseEditModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="card-button button-submit"
                                onClick={confirmEdit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <BottomNavBar />
        </div>
    );
};

export default TimetableContainer;
