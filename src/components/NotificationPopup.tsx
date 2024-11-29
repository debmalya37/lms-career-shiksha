interface LiveClass {
  title: string;
  url: string;
  createdAt: string;
}

interface NotificationPopupProps {
  close: () => void;
  latestLiveClasses: LiveClass[];
  latestTutorial: { title: string; url: string; createdAt: string } | null;
  latestCourse: { title: string; description: string; createdAt: string } | null;
  adminNotifications: { _id: string; text: string; createdAt: string }[]; // Accept admin notifications
}

const NotificationPopup = ({
  close,
  latestLiveClasses,
  latestTutorial,
  latestCourse,
  adminNotifications,
}: NotificationPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
      <button onClick={close} className="absolute top-2 right-2 text-gray-600">✖</button>
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Notifications</h2>

      {/* Latest Live Classes */}
      {latestLiveClasses.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-green-700">Latest Live Classes</h3>
          {latestLiveClasses.map((liveClass, index) => (
            <div key={index} className="mb-2">
              <p className="text-gray-950">Title: {liveClass.title}</p>
              <p className="text-gray-950">
                Date: {new Date(liveClass.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Latest Tutorial */}
      {latestTutorial && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-green-700">Latest Tutorial</h3>
          <p className="text-gray-950">Title: {latestTutorial.title}</p>
          <p className="text-gray-950">
            Date: {new Date(latestTutorial.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Latest Course */}
      {latestCourse && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-green-700">Latest Course</h3>
          <p className="text-gray-950">Title: {latestCourse.title}</p>
          <p className="text-gray-950">Description: {latestCourse.description}</p>
          <p className="text-gray-950">
            Date: {new Date(latestCourse.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
      {/* Admin Notifications */}
      {adminNotifications.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-blue-700">Admin Notifications</h3>
            {adminNotifications.map((notification) => (
              <div key={notification._id} className="mb-2">
                <p className="text-gray-950">{notification.text}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
    </div>
  </div>
  );
};

export default NotificationPopup;



{/* Subscription Days Left */}
{/* <div className="mb-4">
  <h3 className="font-semibold text-lg text-red-600">Subscription</h3>
  <p className="text-black">{subscriptionDaysLeft} days left</p>
</div> */}

{/* Progress Tracker */}
{/* <div className="mb-4">
  <h3 className="font-semibold text-lg text-green-700">Progress Tracker</h3>
  <ProgressBar progress={progress} />
</div> */}

{/* Test Exam Marks */}
{/* <div>
  <h3 className="font-semibold text-lg text-blue-700">Test Exam Marks</h3>
  <p className="text-black">{examMarks} out of 100</p>
</div> */}