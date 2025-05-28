// File: src/app/WorkRequestForm.jsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import toast, { Toaster } from "react-hot-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';


const WorkRequestForm = ({ requestId }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const { currentUser } = useCurrentUser();

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

  
  const onSubmit = async (data) => {
    setLoading(true);
    toast.loading(editing ? "Updating work request..." : "Submitting work request");
  
    try {
      const fileURL = data.file && data.file[0] ? await uploadFile(data.file[0]) : data.fileURL || "";
  

      const workRequest = {
        title: data.title,
        description: data.description,
        budget: data.budget.toString(), // convert number to string here
        category: data.category,
        fileURL,
        deadline: new Date(data.deadline),
        durationDays: data.durationDays || null,
        userId: currentUser?.id,
      };
  
      // Adjust the API route based on whether we're editing or creating a new request
      const method = editing ? "PUT" : "POST";
      const endpoint = editing
        ? `/api/work-request/${requestId}`  // Update existing work request
        : `/api/work-request`; // Ensure the correct route for new submissions
  
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workRequest),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to process request");
      }
  
      toast.dismiss();
      toast.success(editing ? "Work request updated!" : "Work request submitted!");
      router.push("/submissions");
    } catch (error) {
      console.error("Submission error:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to process request!");
    } finally {
      setLoading(false);
    }
  };
  


  // Handle file upload
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("File upload failed");

    const data = await response.json();
    return data.fileURL;
  };

  // Handle cancel action
  const handleCancel = () => {
    if (editing) {
      router.push("/submissions");
    } else {
      reset();
    }
  };

  return (
    <div
      className={`p-6 rounded-md shadow-md ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
      }`}
    >
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium">Title</label>
          <input
            id="title"
            {...register("title", { required: "Title is required" })}
            className="border rounded-md px-3 py-2 w-full"
          />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block font-medium">Description</label>
          <textarea
            id="description"
            {...register("description", { required: "Description is required" })}
            className="border rounded-md px-3 py-2 w-full"
          />
          {errors.description && <p className="text-red-500">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="budget" className="block font-medium">Budget ($)</label>
          <input
            id="budget"
            {...register("budget", { required: "Budget is required", valueAsNumber: true })}
            type="number"
            className="border rounded-md px-3 py-2 w-full"
          />
          {errors.budget && <p className="text-red-500">{errors.budget.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block font-medium">Category</label>
          <input
            id="category"
            {...register("category", { required: "Category is required" })}
            className="border rounded-md px-3 py-2 w-full"
          />
          {errors.category && <p className="text-red-500">{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="deadline" className="block font-medium">Deadline</label>
          <input
            id="deadline"
            type="date"
            {...register("deadline", { required: "Deadline is required" })}
            className="border rounded-md px-3 py-2 w-full"
          />
          {errors.deadline && <p className="text-red-500">{errors.deadline.message}</p>}
        </div>

        <div>
          <label htmlFor="durationDays" className="block font-medium">Estimated Duration (in days)</label>
          <input
            id="durationDays"
            type="number"
            {...register("durationDays", { valueAsNumber: true })}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="file" className="block font-medium">Upload File</label>
          <input
            id="file"
            {...register("file")}
            type="file"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
          {loading ? "Processing..." : editing ? "Update Request" : "Submit Request"}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-600 text-white px-4 py-2 rounded-md w-full mt-2"
        >
          {editing ? "Cancel" : "Clear Form"}
        </button>
      </form>
    </div>
  );
};

export default WorkRequestForm;
