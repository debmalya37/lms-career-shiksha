"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ClipLoader from "react-spinners/ClipLoader";

interface AnswerSubmission {
  questionId: string;
  questionType: 'mcq' | 'descriptive';
  selectedAnswer?: string;
  descriptiveAnswer?: string;
  marks: number;
  isCorrect?: boolean;
  marksAwarded?: number;
  teacherFeedback?: string;
  needsReview: boolean;
}

interface QuizSubmission {
  finalScore: number;
  _id: string;
  quizId: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  subjectId: string;
  quizTitle: string;
  answers: AnswerSubmission[];
  totalScore: number;
  maxScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  status: 'pending_review' | 'reviewed' | 'partially_reviewed';
  submittedAt: string;
  teacherGeneralFeedback?: string;
}

interface Question {
  _id: string;
  question: string;
  questionType: 'mcq' | 'descriptive';
  answers: { text: string; isCorrect: boolean }[];
  marks: number;
  image?: string;
}

interface QuizData {
  _id: string;
  title: string;
  questions: Question[];
}

export default function TeacherReviewPage() {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  
  // Review form state
  const [reviewData, setReviewData] = useState<{
    answers: { marksAwarded: number; teacherFeedback: string }[];
    generalFeedback: string;
  }>({
    answers: [],
    generalFeedback: ""
  });

  const [filter, setFilter] = useState({
    status: 'all',
    quizTitle: '',
    userName: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quiz-submission');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizData = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quiz?quizId=${quizId}`);
      const data = await response.json();
      setQuizData(data);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
  };

  const handleReviewSubmission = async (submission: QuizSubmission) => {
    setSelectedSubmission(submission);
    await fetchQuizData(submission.quizId);
    
    // Initialize review data
    setReviewData({
      answers: submission.answers.map(ans => ({
        marksAwarded: ans.marksAwarded || (ans.questionType === 'mcq' && ans.isCorrect ? ans.marks : 0),
        teacherFeedback: ans.teacherFeedback || ""
      })),
      generalFeedback: submission.teacherGeneralFeedback || ""
    });
  };

  const updateReviewData = (index: number, field: 'marksAwarded' | 'teacherFeedback', value: number | string) => {
    setReviewData(prev => ({
      ...prev,
      answers: prev.answers.map((ans, i) => 
        i === index ? { ...ans, [field]: value } : ans
      )
    }));
  };

  const submitReview = async () => {
    if (!selectedSubmission) return;

    setReviewing(true);
    try {
      const payload = {
        submissionId: selectedSubmission._id,
        answers: reviewData.answers,
        generalFeedback: reviewData.generalFeedback
      };

      const response = await fetch('/api/quiz-submission/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setSelectedSubmission(null);
        setQuizData(null);
        fetchSubmissions(); // Refresh the list
      } else {
        alert('Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'partially_reviewed': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter.status !== 'all' && sub.status !== filter.status) return false;
    if (filter.quizTitle && !sub.quizTitle.toLowerCase().includes(filter.quizTitle.toLowerCase())) return false;
    if (filter.userName && !sub.userName.toLowerCase().includes(filter.userName.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={50} color="#3B82F6" />
      </div>
    );
  }

  // Review Modal
  if (selectedSubmission && quizData) {
    const calculateTotalScore = () => {
      return reviewData.answers.reduce((total, ans) => total + (ans.marksAwarded || 0), 0);
    };

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Review Quiz Submission</h1>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <p><span className="font-medium">Student:</span> {selectedSubmission.userName}</p>
                  <p><span className="font-medium">Email:</span> {selectedSubmission.userEmail}</p>
                  <p><span className="font-medium">Quiz:</span> {selectedSubmission.quizTitle}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
              </div>
              <Button
                onClick={() => {setSelectedSubmission(null); setQuizData(null);}}
                variant="outline"
              >
                Back to List
              </Button>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            {quizData.questions.map((question, qIndex) => {
              const submission = selectedSubmission.answers.find(ans => ans.questionId === question._id);
              if (!submission) return null;

              const isMCQ = question.questionType === 'mcq';
              const review = reviewData.answers[qIndex] || { marksAwarded: 0, teacherFeedback: "" };

              return (
                <div key={question._id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Question Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Question {qIndex + 1}
                    </h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        isMCQ ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {question.questionType.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                        Max: {question.marks} marks
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{question.question}</p>
                    {question.image && (
                      <img
                        src={question.image}
                        alt="Question visual"
                        className="mt-3 max-w-md h-auto rounded-lg border"
                      />
                    )}
                  </div>

                  {/* Student's Answer */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Student&apos;s Answer:</h4>
                    {isMCQ ? (
                      <div>
                        <p className="mb-2">
                          <span className="font-medium">Selected:</span>{" "}
                          <span className={submission.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {submission.selectedAnswer || "Not answered"}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Correct Answer:</span>{" "}
                          <span className="text-green-600">
                            {question.answers.find(a => a.isCorrect)?.text}
                          </span>
                        </p>
                        <p className="mt-2">
                          <span className="font-medium">Auto Score:</span>{" "}
                          <span className={submission.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {submission.isCorrect ? question.marks : -selectedSubmission.totalScore || 0} marks
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {submission.descriptiveAnswer || "No answer provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Teacher Review Section */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-800">Teacher Review:</h4>
                    
                    {/* Marks Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marks Awarded (Max: {question.marks})
                      </label>
                      <input
                      title="Enter marks awarded"
                        type="number"
                        min="0"
                        max={question.marks}
                        step="0.5"
                        value={review.marksAwarded}
                        onChange={(e) => updateReviewData(qIndex, 'marksAwarded', parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isMCQ} // MCQ marks are auto-calculated
                      />
                      {isMCQ && (
                        <p className="text-xs text-gray-500 mt-1">
                          MCQ marks are automatically calculated
                        </p>
                      )}
                    </div>

                    {/* Feedback Textarea */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback for Student
                      </label>
                      <textarea
                        value={review.teacherFeedback}
                        onChange={(e) => updateReviewData(qIndex, 'teacherFeedback', e.target.value)}
                        placeholder="Provide feedback for this answer..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Overall Feedback */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Feedback</h3>
              <textarea
                value={reviewData.generalFeedback}
                onChange={(e) => setReviewData(prev => ({...prev, generalFeedback: e.target.value}))}
                placeholder="Provide overall feedback for the student's performance..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>

            {/* Summary & Submit */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Review Summary</h3>
                  <p className="text-gray-600">
                    Total Score: <span className="font-bold text-blue-600">{calculateTotalScore()}</span> / {selectedSubmission.maxScore}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {setSelectedSubmission(null); setQuizData(null);}}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitReview}
                    disabled={reviewing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {reviewing ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main submissions list view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Submissions Review</h1>
          <p className="text-gray-600">Review and grade student quiz submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
              title="Filter by status"
                value={filter.status}
                onChange={(e) => setFilter(prev => ({...prev, status: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="partially_reviewed">Partially Reviewed</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
              <input
                type="text"
                value={filter.quizTitle}
                onChange={(e) => setFilter(prev => ({...prev, quizTitle: e.target.value}))}
                placeholder="Search by quiz title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input
                type="text"
                value={filter.userName}
                onChange={(e) => setFilter(prev => ({...prev, userName: e.target.value}))}
                placeholder="Search by student name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === 'pending_review').length}
                </p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partially Reviewed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {submissions.filter(s => s.status === 'partially_reviewed').length}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'reviewed').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Submissions</h2>
          </div>
          
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No submissions found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => {
                    const descriptiveCount = submission.answers.filter(ans => ans.questionType === 'descriptive').length;
                    const needsReview = submission.status !== 'reviewed' && descriptiveCount > 0;

                    return (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{submission.userName}</div>
                            <div className="text-sm text-gray-500">{submission.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{submission.quizTitle}</div>
                          <div className="text-sm text-gray-500">
                            {descriptiveCount > 0 && `${descriptiveCount} descriptive questions`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {submission.finalScore || submission.totalScore} / {submission.maxScore}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.correctAnswers}C • {submission.incorrectAnswers}I • {submission.skippedQuestions}S
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                            {submission.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            onClick={() => handleReviewSubmission(submission)}
                            size="sm"
                            className={needsReview ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'}
                          >
                            {needsReview ? 'Review' : 'View'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}