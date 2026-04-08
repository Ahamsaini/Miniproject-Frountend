import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import AdminOnboarding from './pages/AdminOnboarding';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseList from './pages/CourseList';
import CourseForm from './pages/CourseForm';
import LabSessionList from './pages/LabSessionList';
import LabSessionForm from './pages/LabSessionForm';
import LabRecordHistory from './pages/LabRecordHistory';
import SessionControl from './pages/SessionControl';
import CodeSubmission from './pages/CodeSubmission';
import StudentLabHistory from './pages/StudentLabHistory';
import StudentList from './pages/StudentList';
import LabForm from './pages/LabForm';
import StudentEnrollment from './pages/StudentEnrollment';
import StudentDashboard from './pages/StudentDashboard';
import TeacherLabs from './pages/TeacherLabs';
import TeacherHistory from './pages/TeacherHistory';
import CourseDetails from './pages/CourseDetails';
import CurriculumManager from './pages/CurriculumManager';
import StudentTimetable from './pages/StudentTimetable';
import Profile from './pages/Profile';
import TeacherList from './pages/TeacherList';
import AttendanceReports from './pages/AttendanceReports';
import SubjectAttendanceReport from './pages/SubjectAttendanceReport';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/role-selection" />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role-selection" element={<RoleSelection />} />

      {/* Private Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRouter />} />
        <Route path="dashboard" element={<DashboardRouter />} />
        <Route path="courses" element={<CourseList />} />
        <Route path="courses/new" element={<CourseForm />} />
        <Route path="courses/edit/:id" element={<CourseForm />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="labs" element={<LabSessionList />} />
        <Route path="labs/new-lab" element={<LabForm />} />
        <Route path="labs/edit-lab/:id" element={<LabForm />} />
        <Route path="labs/new" element={<LabSessionForm />} />
        <Route path="labs/reschedule/:id" element={<LabSessionForm />} />
        <Route path="labs/history" element={<LabRecordHistory />} />
        <Route path="labs/session/:sessionId" element={<SessionControl />} />
        <Route path="labs/verify/:sessionId" element={<CodeSubmission />} />
        <Route path="my-history" element={<StudentLabHistory />} />
        <Route path="onboarding" element={<AdminOnboarding />} />
        <Route path="students" element={<StudentList />} />
        <Route path="teachers" element={<TeacherList />} />
        <Route path="students/enroll" element={<StudentEnrollment />} />
        <Route path="curriculum" element={<CurriculumManager />} />
        <Route path="attendance" element={<AttendanceReports />} />
        <Route path="attendance/subject" element={<SubjectAttendanceReport />} />
        <Route path="student/timetable" element={<StudentTimetable />} />
        <Route path="profile" element={<Profile />} />


        {/* Teacher Routes */}
        <Route path="teacher/my-labs" element={<TeacherLabs />} />
        <Route path="teacher/all-labs" element={<TeacherLabs />} />
        <Route path="teacher/history" element={<TeacherHistory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Router component to select dashboard based on role
const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);
  if (user?.role === 'TEACHER') return <TeacherDashboard />;
  if (user?.role === 'STUDENT') return <StudentDashboard />;
  return <Dashboard />;
};

export default App;
