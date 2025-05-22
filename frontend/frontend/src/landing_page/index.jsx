import { Spin, Alert, Button, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { Navigate } from "react-router-dom";
import { useEffect } from "react";

const { Title } = Typography;

const LandingPage = ({ error, loading, dashboards }) => {
  console.log(dashboards, "dashboards landing");
  if (loading) {
    return (
      <div className="p-8">
        <Title level={2} className="mb-6">
          Dashboard
        </Title>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin spinning size="large" tip="Loading dashboard..." fullscreen />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert
          message="Error"
          description={error}
          type="error"
          className="mb-6"
          // action={
          //   <Button onClick={fetchData} icon={<ReloadOutlined />}>
          //     Retry
          //   </Button>
          // }
        />
      </div>
    );
  }

  if (!dashboards.length) {
    return (
      <div className="p-8">
        <Title level={2} className="mb-6">
          Dashboard
        </Title>
        <Alert
          message="No Dashboards Available"
          description="There are no dashboards available to display."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return <Navigate to={`/dashboards/${dashboards[0].key}`} />;
};

export default LandingPage;
