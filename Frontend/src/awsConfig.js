import { Auth } from "aws-amplify";

export default {
  Auth: {
    mandatorySignIn: true,
    region: "",
    userPoolId: "",
    userPoolWebClientId: "",
  },
  // API: {
  //   endpoints: [
  //     {
  //       name: "LORA_SBK",
  //       endpoint: "",
  //       custom_header: async () => {
  //         return {
  //           Authorization: `${(await Auth.currentSession())
  //             .getIdToken()
  //             .getJwtToken()}`,
  //         };
  //       },
  //     },
  //   ],
  // },
};
