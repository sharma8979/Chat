import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios"; // Ensure you have a configured axios instance
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(""); 
  const { user } = useContext(UserContext);
  const [projects, setProjects] = useState([]); // Fixed state name for clarity

  const navigate=useNavigate()

  // ✅ Create new project and update UI immediately
  async function createProject(e) {
    e.preventDefault();
    if (!projectName.trim()) {
      alert("Project name is required");
      return;
    }
    try {
      const res = await axios.post("/projects/create", {
        name: projectName,
        userId: user?._id, // ✅ Ensure user ID is sent
      });

      console.log("Project Created:", res.data);
      setProjects((prev) => [...prev, res.data]); // ✅ Add new project to state
      setIsModalOpen(false);
      setProjectName(""); // ✅ Clear input after creation
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project. Please try again.");
    }
  }

  // ✅ Fetch projects when component mounts or when `user` changes
  useEffect(() => {
    if (!user?._id) return; // Prevent API call if user is not available
  
    axios
      .get(`/projects/all`, { params: { userId: user._id } }) // ✅ Pass userId in request
      .then((res) => {
        console.log("User's Projects:", res.data);
        setProjects(res.data.projects);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        alert("Failed to load projects. Please refresh the page.");
      });
  }, [user]); // ✅ Added dependency array to re-fetch when user changes
   // ✅ Added dependency array to avoid unnecessary re-fetching

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-slate-300 rounded-md"
        >
          New Project
          <i className="ri-link ml-2"></i>
        </button>
        {projects.map((project) => (
          <div key={project._id}
          onClick={()=>navigate('/project',{
            state:{project}
          })}
           className="project cursor-pointer p-4 border border-slate-300 rounded-md">
            <h2 className="font-semibold">{project.name}</h2>
            <div className="flex gap-2"> {/* ✅ Fixed CSS class */}
            <p><i className="ri-user-line"></i><small>Collaborators</small></p>
              {project.users.length}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
