import WorkRequestForm from "@/app/components/workRequestForm";

const NewWorkRequestPage = () => {
  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Create New Work Request</h1>
      <WorkRequestForm requestId="new" />
    </div>
  );
};

export default NewWorkRequestPage;
