import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Container from "../components/layout/Container";
import Layout from "../components/layout/Layout";
import { deleteSubscription } from "../utils/services";

const UnsubscribePage: React.FC = () => {
  const router = useRouter();
  const queryEmail = router.query.email as string;
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  useEffect(
    function () {
      handleUnsubscribe();
    },
    [queryEmail]
  );

  async function handleUnsubscribe() {
    if (isUnsubscribed) return;

    const email =
      typeof queryEmail === "string"
        ? queryEmail
        : JSON.parse(localStorage.getItem("subscription") as string)?.email;

    if (!email) return;

    await deleteSubscription(email);
    localStorage.removeItem("subscription");
    setIsUnsubscribed(true);
  }

  return (
    <Layout>
      <Container>
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold text-font-primary mb-2">
            Sorry to see you go!
          </h1>
          <p className="text-font-secondary">
            Remember, you can always re-subscribe if you change your mind!
          </p>
        </div>
      </Container>
    </Layout>
  );
};

export default UnsubscribePage;
