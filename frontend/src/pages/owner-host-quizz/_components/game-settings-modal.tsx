import { Modal, Form, Switch, InputNumber, Button, Space, Alert } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { GameSettings } from "@/utils/gameSettings";
import { saveGameSettings, getGameSettings } from "@/utils/gameSettings";

interface GameSettingsModalProps {
  gameId: string;
  disabled?: boolean;
}

export default function GameSettingsModal({
  gameId,
  disabled = false,
}: GameSettingsModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [shouldShowAutoNextQuestionDelay, setShouldShowAutoNextQuestionDelay] =
    useState(false);

  useEffect(() => {
    if (gameId) {
      const savedSettings = getGameSettings(gameId);
      if (savedSettings) {
        form.setFieldsValue(savedSettings);
        setShouldShowAutoNextQuestionDelay(!!savedSettings.autoNextQuestion);
      }
    }
  }, [gameId, form]);

  const showModal = () => setIsModalOpen(true);

  const handleFinished = (values: GameSettings) => {
    console.log("Game settings saved:", values);
    saveGameSettings(gameId, values);
    setIsModalOpen(false);
  };

  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        onClick={showModal}
        disabled={disabled}
      >
        Game Settings
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined />
            Game Settings
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        width={500}
        footer={null}
      >
        <Form
          onFinish={handleFinished}
          form={form}
          layout="vertical"
          className="mt-4"
        >
          {/* Auto End Question */}
          <Form.Item
            name="autoEndQuestion"
            valuePropName="checked"
            label="Auto End Question"
          >
            <Switch />
          </Form.Item>

          {/* Auto Next Question */}
          <Form.Item
            label="Auto Next Question"
            name="autoNextQuestion"
            valuePropName="checked"
          >
            <Switch
              onChange={(checked) => {
                setShouldShowAutoNextQuestionDelay(checked);
                if (!checked) {
                  form.setFieldValue("autoNextQuestionDelay", undefined);
                } else {
                  form.setFieldValue("autoNextQuestionDelay", 5);
                }
              }}
            />
          </Form.Item>

          {/* Delay input */}
          {shouldShowAutoNextQuestionDelay && (
            <Form.Item
              name="autoNextQuestionDelay"
              label="Auto Next Question Delay (seconds)"
            >
              <Space direction="vertical" className="w-full">
                <InputNumber
                  min={3}
                  max={60}
                  precision={0}
                  style={{ width: "100%" }}
                  addonAfter="seconds"
                />
                <Alert
                  message="The delay will start counting after the question results are shown"
                  type="info"
                  showIcon
                  className="text-xs"
                />
              </Space>
            </Form.Item>
          )}

          <div className="flex justify-end mt-4 gap-1">
            <Button htmlType="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button htmlType="submit" type="primary">
              Save Settings
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
