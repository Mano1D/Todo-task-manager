import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState('personal');
  const [taskFilterOption, setTaskFilterOption] = useState('all');
  const [showTaskTypeMenu, setShowTaskTypeMenu] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskType, setTaskType] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [user, setUser] = useState(null);

  const backendURL = 'http://localhost:5000';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('token');
    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const reminderInterval = setInterval(() => {
        tasks.forEach(task => {
          if (task.deadline && task.status !== 'finished') {
            const now = new Date();
            const deadlineTime = new Date(task.deadline);
            if (deadlineTime <= now || (deadlineTime - now) <= 5 * 60 * 1000) {
              showNotification('Task Reminder', `Deadline reached: ${task.title}`);
            }
          }
        });
      }, 60000);  // Every 1 min
      return () => clearInterval(reminderInterval);
    }
  }, [tasks]);

  useEffect(() => {
    if (window.location.search.includes('sessionExpired')) {
      alert('Session expired. Please login again.');
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUser();
    }
  }, [token]);

  useEffect(() => {
  const socket = io('http://localhost:5000');  // Use your backend URL
  socket.on('connect', () => console.log('Connected to WebSocket'));
  
  socket.on('task-updated', (data) => {
    console.log(data);
    fetchTasks();  // Auto-refresh task list
  });

  return () => socket.disconnect();
}, []);


  const handleApiError = (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/?sessionExpired=true';
      } else {
        console.error('API Error:', error.response.data);
      }
    } else {
      console.error('Unknown API Error:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${backendURL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  const handleCreateTask = async () => {
    try {
      const newTask = {
        title,
        description,
        type: taskType,
        createdAt: new Date().toISOString(),
        deadline: taskType === 'professional' ? deadline : null,
      };
      await axios.post(`${backendURL}/api/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle('');
      setDescription('');
      setDeadline('');
      setShowTaskForm(false);
      setShowTaskTypeMenu(false);
      fetchTasks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'finished' ? 'in-progress' : 'finished';
      await axios.patch(`${backendURL}/api/tasks/${task._id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${backendURL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${backendURL}/api/tasks/${editingTask._id}`, {
        title: editedTitle,
        description: editedDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      handleApiError(error);
    }
  };

 const getTaskStats = (filteredTasks) => {
  const total = filteredTasks.length;
  const finished = filteredTasks.filter(task => task.status === 'finished').length;
  const overdue = filteredTasks.filter(task => isTaskOverdue(task)).length;
  const noDue = filteredTasks.filter(task => !task.deadline).length;
  return { total, finished, overdue, noDue };
};


  const isTaskOverdue = (task) => {
    return task.deadline ? new Date(task.deadline) < new Date() : false;
  };

  function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }

  // Filter + Sort Tasks
  const now = new Date();
  const filteredTasks = tasks
    .filter(task => task.type === filter)
    .filter(task => {
      const deadline = task.deadline ? new Date(task.deadline) : null;
      switch (taskFilterOption) {
        case 'overdue':
          return deadline && deadline < now;
        case 'recent':
          return (now - new Date(task.createdAt)) < 24 * 60 * 60 * 1000;
        case 'nearDeadline':
          return deadline && (deadline - now) <= 60 * 60 * 1000 && (deadline - now) >= 0;
        default:
          return true;
      }
    })
    .sort((a, b) => (a.status === 'finished' ? 1 : -1));

  return (
    <div className="App">
      {!token ? (
        <div className="login-container">
          <h1>Welcome to Task Manager</h1>
          <button onClick={() => window.location.href = `${backendURL}/api/auth/google`}>
            Login with Google
          </button>
        </div>
      ) : (
        <div className="dashboard">
      <div className="sidebar">
  <h2>My Tasks</h2>
  <button
    className={filter === 'personal' ? 'active' : ''}
    onClick={() => { 
      setFilter('personal');
      setShowShareModal(false);  // Close share modal on tab change
    }}
  >
    Personal Tasks
  </button>

  <button
    className={filter === 'professional' ? 'active' : ''}
    onClick={() => { 
      setFilter('professional');
      setShowShareModal(false);
    }}
  >
    Professional Tasks
  </button>

  <button
    className={filter === 'about' ? 'active' : ''}
    onClick={() => { 
      setFilter('about');
      setShowShareModal(false);
    }}
  >
    About
  </button>

  <button onClick={() => setShowShareModal(true)}>Share</button>

  <button onClick={() => { 
    localStorage.removeItem('token');
    window.location.reload();
  }}>
    Logout
  </button>
</div>


          <div className="task-content">
            {filter === 'about' ? (
              <div>
                <h2>User Page</h2>
                <p>Stay focused, stay organized, and make every task count!</p>
                {user && (
                  <div className="user-card">
                    <div className="profile-pic">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h2>{filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks</h2>
              

{/* Insert Progress Bar Here */}
<div className="progress-summary-inline">
  {(() => {
    const { total, finished, overdue, noDue } = getTaskStats(filteredTasks);
    if (total === 0) return <p>No tasks yet.</p>;

    const finishedPercent = (finished / total) * 100;
    const overduePercent = (overdue / total) * 100;
    const noDuePercent = (noDue / total) * 100;

    return (
      <>
        <div className="progress-bar">
          <div className="bar finished" style={{ width: `${finishedPercent}%` }}></div>
          <div className="bar overdue" style={{ width: `${overduePercent}%` }}></div>
          <div className="bar noDue" style={{ width: `${noDuePercent}%` }}></div>
        </div>
        <div className="progress-labels">
          <span>Finished: {finished}</span>
          <span>Overdue: {overdue}</span>
          <span>No Due: {noDue}</span>
          <span>Total: {total}</span>
        </div>
      </>
    );
  })()}
</div>

                <div className="filter-dropdown">
                  <label>Filter Tasks: </label>
                  <select value={taskFilterOption} onChange={(e) => setTaskFilterOption(e.target.value)}>
                    <option value="all">All</option>
                    <option value="overdue">Overdue</option>
                    <option value="recent">Recently Added</option>
                    <option value="nearDeadline">Near Deadline</option>
                  </select>
                </div>

                <ul className="task-list">
                  {filteredTasks.map(task => (
                    <li key={task._id} className={`task-item ${isTaskOverdue(task) ? 'overdue' : ''} ${task.status === 'finished' ? 'finished' : ''}`}>
                      <div className="task-header">
                        <input type="checkbox" checked={task.status === 'finished'} onChange={() => handleToggleStatus(task)} />
                        <div className="task-details">
                          <strong>{task.title}</strong>: {task.description}
                          <p>Status: {task.status === 'finished' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}</p>
                          <small>Created: {new Date(task.createdAt).toLocaleString()}</small>
                          {task.deadline && <><br /><small>Deadline: {new Date(task.deadline).toLocaleString()}</small></>}
                        </div>
                        <div className="task-actions">
                          <button onClick={() => handleEditTask(task)}>✏️</button>
                          <button onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                        </div>
                      </div>

                      {editingTask && editingTask._id === task._id && (
                        <div className="edit-form">
                          <input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
                          <input value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
                          <select value={task.status} onChange={async (e) => {
                            await axios.patch(`${backendURL}/api/tasks/${task._id}/status`, { status: e.target.value }, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            fetchTasks();
                          }}>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="finished">Completed</option>
                          </select>
                          <button onClick={handleSaveEdit}>Save</button>
                          <button onClick={() => setEditingTask(null)}>Cancel</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {showTaskForm && (
                  <div className="task-form">
                    <h3>Add {taskType} Task:</h3>
                    <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    {taskType === 'professional' && <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />}
                    <button onClick={handleCreateTask}>Save Task</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <button className="floating-add-button" onClick={() => setShowTaskTypeMenu(!showTaskTypeMenu)}>+</button>

      {showTaskTypeMenu && (
        <div className="task-type-menu">
          <button onClick={() => { setTaskType('personal'); setShowTaskForm(true); setShowTaskTypeMenu(false); }}>Personal Task</button>
          <button onClick={() => { setTaskType('professional'); setShowTaskForm(true); setShowTaskTypeMenu(false); }}>Professional Task</button>
        </div>
      )}

      {showShareModal && (
        <div className="share-modal">
          <p>Share your task list:</p>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied to clipboard!"); }}>Copy Link</button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`)}>Share via WhatsApp</button>
          <button onClick={() => window.open(`mailto:?subject=My Tasks&body=${encodeURIComponent(window.location.href)}`)}>Share via Email</button>
          <button onClick={() => setShowShareModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
