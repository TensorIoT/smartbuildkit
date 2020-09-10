import React, { useState, useEffect, Suspense } from "react";
import { Auth } from "aws-amplify";

import CustomSignIn from "./CustomSignIn";

const App = React.lazy(() => import("App"));

const AppWithAuth = () => {
  const [user, setUser] = useState("");

  const getUser = async () => {
    const userInfo = await Auth.currentAuthenticatedUser();
    setUser(userInfo.username);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <Suspense fallback={<div />}>
      {user ? (
        //passing setUser to Nav, will reset user when loggin out
        <App setUser={setUser} />
      ) : (
        <div
          slot="sign-in"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "15rem",
          }}
        >
          <CustomSignIn slot="sign-in" setUser={setUser} />
        </div>
      )}
    </Suspense>
  );
};

export default AppWithAuth;
