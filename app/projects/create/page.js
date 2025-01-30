'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateProject() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [numMembers, setNumMembers] = useState(1);
  const [teamMembers, setTeamMembers] = useState([]);
  const [borrowedComponents, setBorrowedComponents] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const members = Array(numMembers).fill("");
    setTeamMembers(members);
  }, [numMembers]);

  const handleTeamMemberChange = (index, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = value;
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!title || !borrowedComponents || teamMembers.some(member => !member)) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const projectData = {
        title,
        teamMembers: teamMembers,
        components: borrowedComponents,
      };

      // Send project data to backend API
      const response = await axios.post('/api/projects/create', projectData);

      if (response.status === 201) {
        router.push(`/`);
      }
    } catch (error) {
      setError("There was an error creating the project.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Create New Project</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block">Project Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label htmlFor="numMembers" className="block">Number of Team Members</label>
          <select
            id="numMembers"
            value={numMembers}
            onChange={(e) => setNumMembers(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        {teamMembers.map((member, index) => (
          <div key={index}>
            <label htmlFor={`teamMember-${index}`} className="block">
              Team Member {index + 1}
            </label>
            <input
              type="text"
              id={`teamMember-${index}`}
              value={member}
              onChange={(e) => handleTeamMemberChange(index, e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ))}

        <div>
          <label htmlFor="borrowedComponents" className="block">Borrowed Components</label>
          <textarea
            id="borrowedComponents"
            value={borrowedComponents}
            onChange={(e) => setBorrowedComponents(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Project
        </button>
      </form>
    </div>
  );
}
