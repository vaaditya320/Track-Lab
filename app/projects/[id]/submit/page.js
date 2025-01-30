"use client"; // Ensure this file is treated as a client-side component

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Use useParams for dynamic routes

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState("");
  const [photo, setPhoto] = useState(null);
  const router = useRouter();
  const params = useParams(); // ✅ Use useParams to get ID properly
  const projectId = params?.id; // ✅ Ensure params is not undefined

  // Fetch project details using the project ID
  useEffect(() => {
    if (status === "authenticated" && projectId) {
      fetch(`/api/projects/${projectId}`)
        .then((response) => response.json())
        .then((data) => setProject(data))
        .catch((error) => {
          console.error("Error fetching project:", error);
        });
    }
  }, [status, projectId]); // ✅ Depend on projectId instead of params.id

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("summary", summary);
    formData.append("photo", photo);

    try {
      const response = await fetch(`/api/projects/${projectId}/complete`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Project submitted successfully.");
        router.push("/"); // Redirect on success
      } else {
        alert("Error submitting project.");
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("Error submitting project.");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div>
      <h1>Submit Project: {project.title}</h1>
      <p><strong>Team Members:</strong> {Array.isArray(project.teamMembers) 
  ? project.teamMembers.join(", ") 
  : JSON.parse(project.teamMembers || "[]").join(", ")}
</p>
      {/* Form to complete the project */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="summary">Summary:</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="photo">Upload Photo:</label>
          <input type="file" id="photo" accept="image/*" onChange={handleFileChange} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Complete
        </button>
      </form>
    </div>
  );
}
