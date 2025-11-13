import LoginForm from '../LoginForm'

export default function LoginFormExample() {
  return (
    <LoginForm
      title="Dashboard Login"
      description="Access your business dashboard"
      onLogin={(email, password) => console.log('Login:', { email, password })}
      showRegisterLink={false}
    />
  )
}
