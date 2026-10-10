import React from 'react';
import { Modal, Button, theme } from 'antd';
import { BookOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { UserGuideView } from '@/features/guide';

export const UserGuideModal: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { userGuideVisible, setUserGuideVisible, language } = useAppStore();
  const isZh = language === 'zh-CN';

  return (
    <Modal
      open={userGuideVisible}
      onCancel={() => setUserGuideVisible(false)}
      centered
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
            <span>
              {isZh
                ? 'WIFIM 智能制造车间操作指南与作业规范 (SOP)'
                : 'WIFIM MES Factory User Guide & SOP'}
            </span>
          </div>
          <Button
            size="small"
            icon={<FullscreenOutlined />}
            onClick={() => {
              setUserGuideVisible(false);
              navigate('/guide');
            }}
          >
            {isZh ? '打开独立全屏页面' : 'Open Full Page Screen'}
          </Button>
        </div>
      }
      width={980}
      footer={null}
      destroyOnHidden
      styles={{ body: { maxHeight: '78vh', overflowY: 'auto', paddingRight: 8 } }}
    >
      <UserGuideView embedded />
    </Modal>
  );
};

export default UserGuideModal;
