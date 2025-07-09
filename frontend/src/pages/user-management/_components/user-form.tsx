import { Button, Form, Modal } from "antd";
import { useState } from "react";

interface UserFormProps {
  isEdit: boolean;
  initialValues?: User;
  onSubmit?: (values: User) => void;
}

type UserFormFields = Omit<
  User,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "lastLogin"
  | "isActive"
  | "provider"
  | "providerId"
>;

function UserForm({ isEdit, initialValues, onSubmit }: UserFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        className="bg-blue-600 text-white"
        onClick={() => {
          setOpen(true);
        }}
      >
        {isEdit ? "Update User" : "Create User"}
      </Button>

      <Modal
        open={open}
        centered
        footer={null}
        onCancel={() => {}}
        title={isEdit ? "Update User" : "Create User"}
      >
        <Form<UserFormFields>
          initialValues={initialValues}
          layout="vertical"
        ></Form>
      </Modal>
    </>
  );
}

export default UserForm;
