import WorkRequestForm from "../../components/workRequestForm";


const WorkRequestPage = ({ params }) => {
  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">
        {params.id === "new" ? "Create Work Request" : "Edit Work Request"}
      </h1>
      <WorkRequestForm requestId={params.id} />
    </div>
  );
};

export default WorkRequestPage;
