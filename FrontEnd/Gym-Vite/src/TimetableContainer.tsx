// TimetableContainer.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import {Container, Card, ListGroup, Button, Modal, Form} from 'react-bootstrap';
import BottomNavBar from './BottomNavBar'; // Import the BottomNavBar component

interface Exercise {
  exercise: string;
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
  const [trainingToDelete, setTrainingToDelete] = useState<number | null>(null);
  const [trainingToEdit, setTrainingToEdit] = useState<number | null>(null);
  const [newStartTime, setNewStartTime] = useState<string>('');
  const [newEndTime, setNewEndTime] = useState<string>('');
  useEffect(() => {
    const fetchTimetable = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Token not found');
        return;
      }

      try {
        const response = await fetch('https://gymmate.pythonanywhere.com/api/getUserTrainings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch timetable');
        }

        const data = await response.json();
        setTrainings(data.trainings);
      } catch (error) {
        setTrainings([]);
        // setError('Error fetching timetable');
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
    const token = localStorage.getItem('token');

    if (!token || !trainingToDelete) {
      setError('Token or training ID not found');
      return;
    }

    try {
      const response = await fetch('https://gymmate.pythonanywhere.com/backgpt/training/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          trainingId: trainingToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete training');
      }

      // Update state to reflect the removed training
      setTrainings((prevTrainings) => prevTrainings.filter((training) => training.training_id !== trainingToDelete));
      // Close the modal
      setShowDeleteModal(false);
    } catch (error) {
      setError('Error deleting training');

    }
  };

  const convertDateFormat = (inputDate: string) => {
  const parsedDate = new Date(inputDate);
  if (isNaN(parsedDate.getTime())) {
    console.error('Invalid date format:', inputDate);
    return null;
  }
  return `${parsedDate.getFullYear()}-${padZero(parsedDate.getMonth() + 1)}-${padZero(parsedDate.getDate())} ${padZero(parsedDate.getHours())}:${padZero(parsedDate.getMinutes())}:${padZero(parsedDate.getSeconds())}`;
};

const padZero = (number: number) => {
  return number < 10 ? `0${number}` : number;
};

  const confirmEdit = async () => {
  const token = localStorage.getItem('token');

  if (!token || !trainingToEdit || !newStartTime || !newEndTime) {
    setError('Token, training ID, or new times not found');
    return;
  }

  // Convert date formats before sending the request
  const formattedStartTime = convertDateFormat(newStartTime);
  const formattedEndTime = convertDateFormat(newEndTime);

  try {
    const response = await fetch('https://gymmate.pythonanywhere.com/backgpt/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        trainingId: trainingToEdit,
        newStartTime: formattedStartTime,
        newEndTime: formattedEndTime,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to edit training time');
    }

    // Close the modal
    setShowEditModal(false);
    // Optionally, you can fetch the updated timetable and update the state
    // based on the changes made on the server.
  } catch (error) {
    console.log(formattedStartTime);
    console.log(formattedEndTime);
    setError('Error editing training time');
  }
};

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTrainingToDelete(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setTrainingToEdit(null);
    setNewStartTime('');
    setNewEndTime('');
  };


  if (error) {
    return <div>Error: {error}</div>;
  }


  if (trainings.length === 0) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Container >
        <div className="text-center mb-4">
          <h2>Your Timetable</h2>
        </div>
        <div className="text-center">
          <p>Looks like you don't have any trainings yet...</p>
          <Button variant="primary">Add</Button>
        </div>
      </Container>
    </div>
  );
}

  // Render your timetable data here
  return (
    <Container style={{ marginBottom: '60px' }}>
      <h2 className="mt-4 mb-4">Your Timetable</h2>
      {trainings.map((training) => (
        <Card key={training.training_id} className="mb-4">
          <Card.Body>
            <Card.Title>Training {training.training_id}</Card.Title>
            <Card.Text>
              <strong>Goal:</strong> {training.goal}
            </Card.Text>
            <Card.Text>
              <strong>Start Time:</strong> {training.training_start}
            </Card.Text>
            <Card.Text>
              <strong>End Time:</strong> {training.training_end}
            </Card.Text>
            <Card.Text>
              <strong>Exercises:</strong>
              <ListGroup>
                {training.exercises.map((exercise, index) => (
                  <ListGroup.Item key={index}>
                    Exercise: {exercise.exercise}, Repetitions: {exercise.repetitions}, Sets: {exercise.sets}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Text>
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between">
            <Button variant="primary">Complete</Button>
            <Button variant="secondary" onClick={() => handleEdit(training.training_id)}>Edit</Button>
            <Button variant="danger" onClick={() => handleDelete(training.training_id)}>Delete</Button>
          </Card.Footer>
        </Card>
      ))}
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this training?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Edit Training Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Training Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="newStartTime">
              <Form.Label>New Start Time:</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="newEndTime">
              <Form.Label>New End Time:</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmEdit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Include the BottomNavBar component */}
      <BottomNavBar />
    </Container>
  );
};

export default TimetableContainer;
