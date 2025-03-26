import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Fix 1: Correct project ID retrieval
  const projectId = location.state?.project?._id;
  
  // Add loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isSidePannelOpen, setIsSidePannelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [users, setUsers] = useState([]);


  useEffect(() => {

    axios.get(`/projects/get-project/${location.state.project._id}`)
      .then(res => {
        console.log(res.data.project)
        setProject(res.data.project);
      })

    // Validate project ID
    if (!projectId) {
      setError("Invalid project access");
      navigate('/'); // Redirect to home if no valid project
      return;
    }

    setLoading(true);
    axios.get('/users/all')
      .then(res => {
        setUsers(res.data.users);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to fetch users");
      })
      .finally(() => setLoading(false));
  }, [projectId, navigate]);

  function addCollaborators() {
    if (!selectedUser.length) {
      setError("Please select at least one user");
      return;
    }

    setLoading(true);
    setError(null);

    axios.put('/projects/add-user', {
      projectId,
      users: selectedUser
    })
      .then(() => {
        setIsModalOpen(false);
        setSelectedUser([]); // Reset selection after successful addition
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to add collaborators");
      })
      .finally(() => setLoading(false));
  }

  const handleUserSelect = (userId) => {
    setSelectedUser(prevSelected => 
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId) // Remove userId if present
        : [...prevSelected, userId] // Add userId if not present
    );
  };


  // Add error display in the UI
  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main className='h-screen w-screen flex relative'>
      <section className='left relative flex flex-col h-full min-w-100 bg-slate-300'>
        <header className='flex justify-between items-center bg-slate-100 p-2 px-2 w-full'>
          <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-large-fill mr-1"></i>
            <p>Add Collaborator</p>
          </button>
          <button onClick={() => setIsSidePannelOpen(!isSidePannelOpen)} className='p-2 hover:bg-slate-300 rounded-full transition-colors'>
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col">
          <div className="message-box gap-1 flex-grow overflow-y-auto p-4">
            <div className="max-w-56 message flex p-2 bg-slate-50 w-fit rounded-md flex-col font-light ">
              <small className='opacity-65 text-sm'>example@gmail.com</small>
              <p className='text-sm'>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
            </div>
            <div className="ml-auto max-w-56 mt-2 incomming message flex p-2 bg-slate-50 w-fit rounded-md flex-col font-light ">
              <small className='opacity-65 text-sm'>example@gmail.com</small>
              <p className='text-sm'>Lorem ipsum dolor sit amet.</p>
            </div>
          </div>
          <div className="inputField w-full flex items-center bg-white p-2 gap-2">
            <input className='flex-grow p-2 px-4 border rounded-full outline-none' type="text" placeholder='Enter Message' />
            <button className='p-3 hover:bg-slate-100 rounded-full transition-colors'>
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div className={`side-pannel w-full h-full bg-slate-50 flex flex-col gap-2 absolute transition-all ${isSidePannelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <header className='flex justify-end p-2 px-3 bg-slate-200'>
            <button onClick={() => setIsSidePannelOpen(!isSidePannelOpen)} className='p-2 hover:bg-slate-300 rounded-full transition-colors'>
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            <div className="user flex gap-2 cursor-pointer hover:bg-slate-200 p-2 items-center">
              <div className='aspect-square rounded-full w-fit p-5 text-white h-fit flex items-center justify-center p-2 bg-slate-600'>
                <i className="ri-user-fill"></i>
              </div>
              <h1 className='font-semibold text-lg'>username</h1>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {users.map(user => (
                <div 
                  key={user._id} 
                  onClick={() => handleUserSelect(user._id)}
                  className={`flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors ${selectedUser.includes(user._id) ? 'bg-slate-100' : ''}`}
                >
                  <div className="bg-slate-600 text-white p-3 rounded-full">
                    <i className="ri-user-fill"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <button onClick={addCollaborators} className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Project;
