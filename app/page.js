'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState, Fragment } from "react"; // Import Fragment here
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);

  // Fetch projects if user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      // Add your logic to fetch projects here
    }
  }, [status]);

  return (
    <Fragment>
      <div>
        <h1>Welcome to TrackLab</h1>
        {status === "authenticated" ? (
          <div>
            <p>Welcome, {session.user.name}</p>
            {/* Render the user's projects */}
            <div>
              {projects.length > 0 ? (
                <ul>
                  {projects.map((project) => (
                    <li key={project.id}>
                      <Link href={`/projects/${project.id}`}>{project.name}</Link>
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
