"use client";
import ProgressBar from './ProgressBar';

interface NotificationPopupProps {
  close: () => void;
  latestLiveClass: { title: string; url: string; createdAt: string } | null;
  latestTutorial: { title: string; url: string; createdAt: string } | null;
  latestCourse: { title: string; description: string; createdAt: string } | null;
}

const NotificationPopup = ({
  close,
  latestLiveClass,
  latestTutorial,
  latestCourse,
}: NotificationPopupProps) => {
  const subscriptionDaysLeft = 30;
  const progress = 50;
  const examMarks = 80;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button onClick={close} className="absolute top-2 right-2 text-gray-600">✖</button>
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Notifications</h2>
        
        {/* Latest Live Class */}
        {latestLiveClass && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-green-700">Latest Live Class</h3>
            <p className='text-gray-950'>Title: {latestLiveClass.title}</p>
            <p className='text-gray-950'>Date: {new Date(latestLiveClass.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        {/* Latest Tutorial */}
        {latestTutorial && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-green-700">Latest Tutorial</h3>
            <p className='text-gray-950'>Title: {latestTutorial.title}</p>
            <p className='text-gray-950'>Date: {new Date(latestTutorial.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        {/* Latest Course */}
        {latestCourse && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-green-700">Latest Course</h3>
            <p className='text-gray-950'>Title: {latestCourse.title}</p>
            <p className='text-gray-950'>Description: {latestCourse.description}</p>
            <p className='text-gray-950'>Date: {new Date(latestCourse.createdAt).toLocaleDateString()}</p>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default NotificationPopup;
