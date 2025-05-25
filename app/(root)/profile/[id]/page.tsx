const ProfilePage = async (params: { params: Promise<{ id: string }> }) => {
  const { id } = await params.params;
  return <>{id}</>;
};

export default ProfilePage;
