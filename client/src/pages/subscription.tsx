import { useRouter } from "next/router";
import Container from "../components/layout/Container";
import Layout from "../components/layout/Layout";
import Divider from "../components/ui/Divider";
import NavLink from "../components/util/NavLink";
import { sendWelcomeEmail } from "../utils/services";

const SubscriptionPage: React.FC = () => {
  const router = useRouter();

  function handleUnsubscribeClicked() {
    router.push("/unsubscribe");
  }

  async function handleResendEmailClicked() {
    const email = JSON.parse(
      localStorage.getItem("subscription") || "{}"
    ).email;
    await sendWelcomeEmail(email);
  }

  return (
    <Layout>
      <Container>
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold text-font-primary mb-2">
            You're subscribed!
          </h1>
          <p className="text-lg text-font-secondary mb-12">
            You'll be notified when bitcoin's popularity reaches lows.
          </p>
          <p className="text-sm text-font-secondary mb-4">
            You should receive a welcome email shortly. Be sure to check your
            spam folder.
          </p>
          <div className="flex justify-center">
            <button
              className="px-6 py-2 text-sm font-semibold text-font-secondary"
              onClick={handleResendEmailClicked}
            >
              RESEND EMAIL
            </button>
            <Divider vertical />
            <NavLink href="/unsubscribe">
              <button
                className="px-6 py-2 text-sm font-semibold text-font-secondary"
                onClick={handleUnsubscribeClicked}
              >
                UNSUBSCRIBE
              </button>
            </NavLink>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default SubscriptionPage;
