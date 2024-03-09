import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-auth-light bg-cover bg-center bg-no-repeat dark:bg-auth-dark">
      {children}
    </main>
  );
};

export default AuthLayout;
