import useSubmitData from "@/hooks/useSubmitData";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Button, message, Popconfirm, type PopconfirmProps } from "antd";
import { useState } from "react";

interface DeleteConfirmProps {
  onDelete?: () => void;
  term: string;
  endpoint: string;
  queryKey: QueryKey;
}

function DeleteConfirm({
  onDelete,
  term,
  endpoint,
  queryKey,
}: DeleteConfirmProps) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const onSuccess = () => {
    message.success(`${term} deleted successfully`);
    queryClient.invalidateQueries({ queryKey });
    setOpen(false);
    onDelete?.();
  };

  const { mutate, isPending } = useSubmitData(
    endpoint,
    onSuccess,
    (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete";
      message.error(errorMessage);
    }
  );

  const confirm: PopconfirmProps["onConfirm"] = (e) => {
    console.log(e);
    mutate({ type: "delete", data: {} });
  };

  const cancel: PopconfirmProps["onCancel"] = (e) => {
    console.log(e);
    message.info("User deletion cancelled");
    setOpen(false);
  };
  return (
    <Popconfirm
      title={`Are you sure you want to delete this ${term}?`}
      description={`This action cannot be undone.`}
      placement="topRight"
      onConfirm={confirm}
      open={open}
      onCancel={cancel}
      okButtonProps={{ loading: isPending }}
      okText={"Delete"}
      cancelText={"Cancel"}
    >
      <Button
        color="danger"
        variant="solid"
        size="small"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
    </Popconfirm>
  );
}

export default DeleteConfirm;
