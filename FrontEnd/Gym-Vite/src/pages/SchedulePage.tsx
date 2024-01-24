import * as React from 'react';
import { useEffect, useState } from 'react';


interface Exercise {
  exercise: string;
  repetitions: number;
  sets: number;
}

interface Training {
  startTime: string;
  endTime: string;
  daygoal: string;
  exercises: Exercise[];
}

const SchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<Training[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSchedule = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        // Handle the case where the token is missing
        setError('Token not found');
        setLoading(false);
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

        if (response.status === 200) {
          const data = await response.json();



          setSchedule(data);
          console.log(data)
        } else {
          setError('Failed to fetch schedule');
        }
      } catch (error) {
        setError('Error fetching schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Training Schedule</h2>

      {schedule.map((daySchedule, index) => (
        <div key={index} className="mb-5">
          <h4>{`Day ${index + 1} - ${daySchedule[0].daygoal}`}</h4>
          {daySchedule.map((training, subIndex) => (
            <div key={subIndex} className="mb-3">
              <p>{`Start Time: ${training.startTime} | End Time: ${training.endTime}`}</p>
              {training.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex}>
                  <p>{`Exercise: ${exercise.exercise} | Repetitions: ${exercise.repetitions} | Sets: ${exercise.sets}`}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SchedulePage;