import WorkRequestForm from "../../components/workRequestForm";

const WorkRequestPage = async ({ params }) => {
  const { id } = await params; // Await params

  // Handle undefined params
  if (!id) return <div>Loading...</div>;

  // Render the form
  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">
        {id === "new" ? "Create Work Request" : "Edit Work Request"}
      </h1>
      <WorkRequestForm requestId={id} />
    </div>
  );
};

export default WorkRequestPage;
