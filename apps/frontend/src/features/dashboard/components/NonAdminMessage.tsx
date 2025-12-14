export const NonAdminMessage = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-500">
        User management features are available to administrators only.
      </p>
    </div>
  );
};
