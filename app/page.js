'use client';  // Ensure this file is treated as a client-side component

import { useSession } from "next-auth/react";
import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      axios
        .get("/api/projects", { headers: { Authorization: `Bearer ${session.user.id}` } })
        .then((response) => {
          setProjects(response.data); // Use the response data directly
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
          setError("There was an issue fetching your projects.");
        });
    }
  }, [status, session?.user.id]);

  const handleDownloadSummary = (projectId) => {
    axios
      .get(`/api/projects/${projectId}/download`)
      .then(() => {
        alert("The project summary has been emailed to you.");
      })
      .catch((error) => {
        console.error("Error downloading summary:", error);
        alert("There was an issue downloading the summary.");
      });
  };

  const handleSubmitProject = (projectId) => {
    router.push(`/projects/${projectId}/submit`);
  };

  return (
    <Fragment>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to TrackLab</h1>
        
        {status === "authenticated" ? (
          <div>
            <p className="text-lg mb-4">Welcome, {session.user.name}</p>

            <Link href="/projects/create">
              <button className="bg-green-500 text-white px-4 py-2 rounded mb-4">
                Create Project
              </button>
            </Link>

            {error && <p className="text-red-500">{error}</p>}

            {projects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">S. No.</th>
                      <th className="border border-gray-300 px-4 py-2">Project Name</th>
                      <th className="border border-gray-300 px-4 py-2">Status</th>
                      <th className="border border-gray-300 px-4 py-2">Download Summary</th>
                      <th className="border border-gray-300 px-4 py-2">Submit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr key={project.id} className="text-center border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">{project.title}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {project.status === "PARTIAL" ? "Partial" : "Submitted"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => handleDownloadSummary(project.id)}
                          >
                            Download
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {project.status === "PARTIAL" ? (
                            <button
                              className="bg-yellow-500 text-white px-4 py-2 rounded"
                              onClick={() => handleSubmitProject(project.id)}
                            >
                              Submit
                            </button>
                          ) : (
                            <span className="text-gray-500">Already Submitted</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-gray-600">No projects found.</p>
            )}
          </div>
        ) : (
          <p className="text-red-500">Please sign in to view your projects.</p>
        )}
      </div>
    </Fragment>
  );
}
