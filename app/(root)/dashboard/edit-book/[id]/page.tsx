const EditBookPage = async (params: { id: Promise<{ id: string }> }) => {
  const { id } = await params.id;
  if (!id) {
    return <div>Book not found</div>;
  }
  return <>{id}</>;
};

export default EditBookPage;
