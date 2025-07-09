import useSubmitData from "@/hooks/useSubmitData";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  message,
  Popconfirm,
  Tooltip,
  type PopconfirmProps,
} from "antd";
import { useState } from "react";

interface BanUserProps {
  isBanned: boolean;
  id: string;
}

function BanUser({ isBanned, id }: BanUserProps) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const confirm: PopconfirmProps["onConfirm"] = (e) => {
    console.log(e);
    mutate({
      type: "patch",
      data: {
        isBanned: !isBanned,
      },
    });
  };

  const cancel: PopconfirmProps["onCancel"] = (e) => {
    console.log(e);
    message.info("User deletion cancelled");
    setOpen(false);
  };

  const onSuccess = () => {
    message.success(`User ${isBanned ? "unbanned" : "banned"} successfully`);
    queryClient.invalidateQueries({
      queryKey: ["/users/list"],
    });
    setOpen(false);
  };

  const { mutate, isPending } = useSubmitData(
    `/users/${id}/ban`,
    onSuccess,
    (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete";
      message.error(errorMessage);
    }
  );

  return (
    <Popconfirm
      title={`Are you sure you want to ${
        isBanned ? "unban" : "ban"
      } this user?`}
      description={`This action cannot be undone.`}
      placement="topRight"
      onConfirm={confirm}
      open={open}
      onCancel={cancel}
      okButtonProps={{
        loading: isPending,
        style: {
          backgroundColor: isBanned ? "#f5222d" : "#52c41a",
          color: "#fff",
        },
      }}
      okText={`${isBanned ? "Unban" : "Ban"}
        `}
      cancelText={"Cancel"}
    >
      <Tooltip
        title={`Click to ${isBanned ? "unban" : "ban"} this user`}
        placement="top"
      >
        <Button
          color="danger"
          variant="solid"
          shape="circle"
          icon={isBanned ? <UnlockOutlined /> : <LockOutlined />}
          onClick={() => setOpen(true)}
        />
      </Tooltip>
    </Popconfirm>
  );
}

export default BanUser;
