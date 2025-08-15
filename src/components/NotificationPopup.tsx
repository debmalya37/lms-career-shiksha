import React, { useEffect, useState } from 'react';
import { 
  X, 
  Bell, 
  Video, 
  BookOpen, 
  GraduationCap, 
  AlertCircle,
  Clock,
  Calendar,
  ArrowRight,
  Zap
} from 'lucide-react';

interface LiveClass {
  title: string;
  url: string;
  createdAt: string;
}

interface NotificationPopupProps {
  close: () => void;
  latestLiveClasses?: LiveClass[];
  latestTutorial?: { title: string; url: string; createdAt: string } | null;
  latestCourse?: { title: string; description: string; createdAt: string } | null;
  adminNotifications?: { _id: string; text: string; createdAt: string }[];
}

const NotificationPopup = ({
  close,
  latestLiveClasses = [],
  latestTutorial = null,
  latestCourse = null,
  adminNotifications = [],
}: NotificationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAllLiveClasses, setShowAllLiveClasses] = useState(false);
  const [showAllAdminNotifications, setShowAllAdminNotifications] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
    
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(close, 300); // Wait for animation to complete
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const NotificationCard = ({ 
    icon: Icon, 
    title, 
    children, 
    iconColor = "text-blue-500",
    iconBg = "bg-blue-50"
  }: { 
    icon: any; 
    title: string; 
    children: React.ReactNode;
    iconColor?: string;
    iconBg?: string;
  }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-200">
      <div className="flex items-start space-x-4">
        <div className={`${iconBg} ${iconColor} p-3 rounded-xl flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            {title}
            <Zap className="w-4 h-4 ml-2 text-yellow-500" />
          </h3>
          {children}
        </div>
      </div>
    </div>
  );

  const hasNotifications = latestLiveClasses.length > 0 || latestTutorial || latestCourse || adminNotifications.length > 0;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`relative bg-gray-50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ${
            isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-6 py-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute top-8 right-8 w-8 h-8 bg-white/50 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/20 rounded-full"></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Notifications
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Stay updated with latest content
                  </p>
                </div>
              </div>
              
              <button
              title='Close Notifications'
                onClick={handleClose}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-2.5 transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
            {!hasNotifications ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-8 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No New Notifications</h3>
                <p className="text-gray-500">You&apos;re all caught up! Check back later for updates.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Latest Live Classes */}
                {latestLiveClasses.length > 0 && (
                  <NotificationCard
                    icon={Video}
                    title="Live Classes"
                    iconColor="text-red-600"
                    iconBg="bg-red-50"
                  >
                    <div className="space-y-4">
                      {(showAllLiveClasses ? latestLiveClasses : latestLiveClasses.slice(0, 3)).map((liveClass, index) => (
                        <div key={index} className="group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                                {liveClass.title}
                              </p>
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(liveClass.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                <span className="mx-2">•</span>
                                <Clock className="w-4 h-4 mr-1" />
                                {formatRelativeTime(liveClass.createdAt)}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors ml-3 flex-shrink-0 mt-1" />
                          </div>
                          {index < (showAllLiveClasses ? latestLiveClasses : latestLiveClasses.slice(0, 3)).length - 1 && (
                            <div className="border-b border-gray-100 mt-4"></div>
                          )}
                        </div>
                      ))}
                      {latestLiveClasses.length > 3 && !showAllLiveClasses && (
                        <button
                          onClick={() => setShowAllLiveClasses(true)}
                          className="text-sm text-red-600 font-medium hover:text-red-700 transition-colors cursor-pointer hover:underline focus:outline-none focus:underline"
                        >
                          +{latestLiveClasses.length - 3} more live classes
                        </button>
                      )}
                      {showAllLiveClasses && latestLiveClasses.length > 3 && (
                        <button
                          onClick={() => setShowAllLiveClasses(false)}
                          className="text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors cursor-pointer hover:underline focus:outline-none focus:underline"
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  </NotificationCard>
                )}

                {/* Latest Tutorial */}
                {latestTutorial && (
                  <NotificationCard
                    icon={BookOpen}
                    title="New Tutorial"
                    iconColor="text-green-600"
                    iconBg="bg-green-50"
                  >
                    <div className="group cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                            {latestTutorial.title}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(latestTutorial.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4 mr-1" />
                            {formatRelativeTime(latestTutorial.createdAt)}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors ml-3 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </NotificationCard>
                )}

                {/* Latest Course */}
                {latestCourse && (
                  <NotificationCard
                    icon={GraduationCap}
                    title="New Course Available"
                    iconColor="text-purple-600"
                    iconBg="bg-purple-50"
                  >
                    <div className="group cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {latestCourse.title}
                          </p>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {latestCourse.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(latestCourse.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4 mr-1" />
                            {formatRelativeTime(latestCourse.createdAt)}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors ml-3 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </NotificationCard>
                )}

                {/* Admin Notifications */}
                {adminNotifications.length > 0 && (
                  <NotificationCard
                    icon={AlertCircle}
                    title="Important Updates"
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                  >
                    <div className="space-y-4">
                      {(showAllAdminNotifications ? adminNotifications : adminNotifications.slice(0, 3)).map((notification) => (
                        <div key={notification._id} className="group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                                {notification.text}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                <span className="mx-2">•</span>
                                <Clock className="w-4 h-4 mr-1" />
                                {formatRelativeTime(notification.createdAt)}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors ml-3 flex-shrink-0 mt-1" />
                          </div>
                          {notification !== (showAllAdminNotifications ? adminNotifications : adminNotifications.slice(0, 3))[(showAllAdminNotifications ? adminNotifications : adminNotifications.slice(0, 3)).length - 1] && (
                            <div className="border-b border-gray-100 mt-4"></div>
                          )}
                        </div>
                      ))}
                      {adminNotifications.length > 3 && !showAllAdminNotifications && (
                        <button
                          onClick={() => setShowAllAdminNotifications(true)}
                          className="text-sm text-amber-600 font-medium hover:text-amber-700 transition-colors cursor-pointer hover:underline focus:outline-none focus:underline"
                        >
                          +{adminNotifications.length - 3} more notifications
                        </button>
                      )}
                      {showAllAdminNotifications && adminNotifications.length > 3 && (
                        <button
                          onClick={() => setShowAllAdminNotifications(false)}
                          className="text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors cursor-pointer hover:underline focus:outline-none focus:underline"
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  </NotificationCard>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {hasNotifications && (
            <div className="bg-white border-t border-gray-100 px-6 py-4">
              <button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Got it, thanks!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;