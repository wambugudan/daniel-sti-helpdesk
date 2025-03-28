"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const WorkRequestForm = ({ requestId }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Check if editing an existing request
  useEffect(() => {
    if (requestId && requestId !== "new") {
      fetchWorkRequest();
    }
  }, [requestId]);

  // Fetch work request from the API
  const fetchWorkRequest = async () => {
    try {
      const response = await fetch(`/api/work-request/${requestId}`);
      if (!response.ok) throw new Error("Failed to fetch work request");

      const data = await response.json();
      Object.keys(data).forEach((key) => setValue(key, data[key]));
      setEditing(true);
    } catch (error) {
      toast.error("Error fetching work request");
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    toast.loading(editing ? "Updating work request..." : "Submitting work request");

    const workRequest = {
      title: data.title,
      description: data.description,
      budget: parseFloat(data.budget),
      category: data.category,
      fileURL: data.file && data.file[0] ? await uploadFile(data.file[0]) : data.fileURL || "", // Default to empty string if no file
    };

    try {
      const response = await fetch(`/api/work-request/${editing ? requestId : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workRequest),
      });

      if (!response.ok) throw new Error("Failed to process request");

      toast.dismiss();
      toast.success(editing ? "Work request updated!" : "Work request submitted!");
      router.push("/submissions");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to process request!");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle file upload
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("File upload failed");

    const data = await response.json();
    return data.fileURL; // Return the uploaded file URL
  };

  // Handle deleting a work request
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this work request?")) return;

    try {
      const response = await fetch(`/api/work-request/${requestId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete request");

      toast.success("Work request deleted!");
      router.push("/submissions");
    } catch (error) {
      toast.error("Failed to delete request!");
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("title", { required: "Title is required" })}
          placeholder="Work Request Title"
          className="border rounded-md px-3 py-2 w-full"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <textarea
          {...register("description", { required: "Description is required" })}
          placeholder="Description"
          className="border rounded-md px-3 py-2 w-full"
        />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}

        <input
          {...register("budget", { required: "Budget is required", valueAsNumber: true })}
          type="number"
          placeholder="Budget ($)"
          className="border rounded-md px-3 py-2 w-full"
        />
        {errors.budget && <p className="text-red-500">{errors.budget.message}</p>}

        <input
          {...register("category", { required: "Category is required" })}
          placeholder="Category"
          className="border rounded-md px-3 py-2 w-full"
        />
        {errors.category && <p className="text-red-500">{errors.category.message}</p>}

        <input {...register("file")} type="file" className="w-full border px-3 py-2 rounded-md" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
          {loading ? "Processing..." : editing ? "Update Request" : "Submit Request"}
        </button>

        {editing && (
          <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md w-full mt-2">
            Delete Request
          </button>
        )}
      </form>
    </div>
  );
};

export default WorkRequestForm;
