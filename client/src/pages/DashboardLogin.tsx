import LoginForm from "@/components/LoginForm";

export default function DashboardLogin() {
  return (
    <LoginForm
      title="Dashboard Login"
      description="Access your business dashboard"
      onLogin={(email, password) => {
        console.log('Dashboard login:', { email, password });
        // TODO: remove mock functionality
        window.location.href = '/dashboard';
      }}
    />
  );
}
