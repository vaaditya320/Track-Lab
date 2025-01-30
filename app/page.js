'use client';  // Make sure this file is treated as a client-side component

import { useSession } from "next-auth/react";
import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import axios from "axios"; // Import axios for API calls
import { useRouter } from "next/navigation"; // Using next/navigation to handle routing

export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(""); // To handle any errors during the fetch
  const router = useRouter(); // Client-side router

  // Fetch projects if user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      // Fetch projects for the authenticated user
      axios
        .get("/api/projects", { headers: { Authorization: `Bearer ${session.user.id}` } })
        .then((response) => {
          setProjects(response.data);
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
          setError("There was an issue fetching your projects.");
        });
    }
  }, [status, session?.user.id]);

  // Function to handle downloading the project summary (PDF)
  const handleDownloadSummary = (projectId) => {
    axios
      .get(`/api/projects/${projectId}/download`)
      .then((response) => {
        // Response is successfully handled here (email sent with PDF)
        alert("The project summary has been emailed to you.");
      })
      .catch((error) => {
        console.error("Error downloading summary:", error);
        alert("There was an issue downloading the summary.");
      });
  };

  // Function to handle redirecting to the submit page
  const handleSubmitProject = (projectId) => {
    // Redirect to the submit page instead of sending the POST request directly
    router.push(`/projects/${projectId}/submit`);
  };

  return (
    <Fragment>
      <div>
        <h1>Welcome to TrackLab</h1>
        {status === "authenticated" ? (
          <div>
            <p>Welcome, {session.user.name}</p>

            {/* Create Project Button */}
            <Link href="/projects/create">
              <button className="bg-green-500 text-white px-4 py-2 rounded mb-4">
                Create Project
              </button>
            </Link>

            {/* Render the user's projects */}
            <div>
              {error && <p className="text-red-500">{error}</p>}
              {projects.length > 0 ? (
                <ul className="list-decimal pl-6">
                  {projects.map((project, index) => (
                    <li key={project.id} className="mb-4">
                      <span>{index + 1}. {project.title}</span>
                      <div className="mt-2">
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                          onClick={() => handleDownloadSummary(project.id)}
                        >
                          Download Summary
                        </button>
                        <button
                          className="bg-yellow-500 text-white px-4 py-2 rounded"
                          onClick={() => handleSubmitProject(project.id)} // Redirect to submit page
                        >
                          Submit
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No projects found.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Please sign in to view your projects.</p>
        )}
      </div>
    </Fragment>
  );
}
