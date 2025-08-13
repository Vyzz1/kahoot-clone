import axios from "@/api/axios";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin, Result, Button } from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

function OAuthCallBack() {
  const [searchParams] = useSearchParams();
  const { setAuth, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    if (error) {
      hasProcessed.current = true;
      setLoading(false);
      setSuccess(false);
      setErrorMessage("OAuth authorization was cancelled or failed.");
      return;
    }

    if (!code) {
      hasProcessed.current = true;
      setLoading(false);
      setSuccess(false);
      setErrorMessage("No authorization code received.");
      return;
    }

    const fetchData = async () => {
      try {
        hasProcessed.current = true;
        setLoading(true);
        const response = await axios.post("/oauth/googleCallback", {
          code,
        });

        if (response.status === 200) {
          const { accessToken, ...userData } = response.data;

          setAuth({
            accessToken: accessToken,
          });

          updateCurrentUser(userData);

          setSuccess(true);

          setTimeout(() => {
            navigate("/settings/quiz-management", { replace: true });
          }, 2000);
        }
      } catch (error: any) {
        setSuccess(false);
        const message =
          error.response?.data?.message ||
          "Google OAuth authentication failed.";
        setErrorMessage(message);
        console.error("Error during Google OAuth callback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, error, setAuth, updateCurrentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            size="large"
          />
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Completing your login...
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we authenticate your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          title="Login Successful!"
          subTitle="You have been successfully authenticated with Google. Redirecting to dashboard..."
          extra={
            <Button
              type="primary"
              onClick={() =>
                navigate("/admin/user-management", { replace: true })
              }
            >
              Go to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
        title="Authentication Failed"
        subTitle={errorMessage || "Something went wrong during authentication."}
        extra={[
          <Button type="primary" key="retry" onClick={() => navigate("/login")}>
            Try Again
          </Button>,
          <Button key="home" onClick={() => navigate("/")}>
            Go Home
          </Button>,
        ]}
      />
    </div>
  );
}

export default OAuthCallBack;
