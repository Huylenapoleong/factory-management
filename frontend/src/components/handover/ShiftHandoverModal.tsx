import React, { useState } from 'react';
import { Modal, Button, Tag, Divider, Row, Col, Table, message } from 'antd';
import {
  PrinterOutlined,
  CheckCircleFilled,
  FileDoneOutlined,
  SafetyCertificateFilled,
  AuditOutlined,
  AlertOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { playSuccessChime } from '@/utils/audioAlert';

export const ShiftHandoverModal: React.FC = () => {
  const { t } = useTranslation();
  const { shiftHandoverVisible, setShiftHandoverVisible, language } = useAppStore();
  const [incomingSigned, setIncomingSigned] = useState<boolean>(false);
  const [signedTime, setSignedTime] = useState<string>('');

  const handleSign = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    setIncomingSigned(true);
    setSignedTime(now);
    playSuccessChime();
    message.success(
      language === 'zh-CN'
        ? '接班领班李伟已完成电子签章核准！'
        : 'Incoming Supervisor Li Wei has signed and accepted shift custody.'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const incidentsData = [
    {
      key: '1',
      time: '11:20',
      equipment: 'CNC-02 Milling Center',
      incident: language === 'zh-CN' ? '刀具磨损传感器触发报警，换刀耗时 12分钟' : 'Tooling wear sensor triggered; tool replaced in 12 min',
      status: language === 'zh-CN' ? '已恢复正常' : 'Resolved',
      statusColor: 'success',
    },
    {
      key: '2',
      time: '14:15',
      equipment: 'SMT Line #01 (Feeder #4)',
      incident: language === 'zh-CN' ? '供料器飞达卡带，停机 8分钟清理' : 'Tape feeder jam; 8 min downtime for tape clearing',
      status: language === 'zh-CN' ? '已恢复正常' : 'Resolved',
      statusColor: 'success',
    },
    {
      key: '3',
      time: '16:00',
      equipment: 'Hydraulic Press #03',
      incident: language === 'zh-CN' ? '润滑油液位处于下限，已交待下班补充' : 'Lube reservoir low level; handed over for evening refill',
      status: language === 'zh-CN' ? '交接注意' : 'Watch List',
      statusColor: 'warning',
    },
  ];

  return (
    <Modal
      open={shiftHandoverVisible}
      onCancel={() => setShiftHandoverVisible(false)}
      width={860}
      footer={[
        <Button key="close" onClick={() => setShiftHandoverVisible(false)}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="pdf"
          icon={<FilePdfOutlined />}
          onClick={handlePrint}
        >
          {t('handover.exportPdf')}
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ backgroundColor: '#1677ff' }}
        >
          {t('handover.printDocket')}
        </Button>,
      ]}
      styles={{
        body: { padding: '16px 20px', maxHeight: '78vh', overflowY: 'auto' },
      }}
    >
      {/* Printable Container with print-specific ID and styling */}
      <div id="printable-shift-docket" className="shift-docket-container">
        {/* Style block for clean A4 printing */}
        <style>
          {`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-shift-docket, #printable-shift-docket * {
                visibility: visible !important;
              }
              #printable-shift-docket {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 16px !important;
                background: #ffffff !important;
                color: #000000 !important;
              }
              .ant-modal-close, .ant-modal-footer, .no-print {
                display: none !important;
              }
            }
          `}
        </style>

        {/* Docket Header */}
        <div style={{ borderBottom: '2px solid #1f2937', paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AuditOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '0.02em' }}>
                  WIFIM MES
                </span>
                <Tag color="blue" style={{ borderRadius: 2, fontWeight: 600 }}>
                  ISO-9001 / IATF-16949 COMPLIANT
                </Tag>
              </div>
              <h2 style={{ margin: '4px 0 0 0', fontSize: 16, fontWeight: 700, color: '#1f2937' }}>
                {t('handover.title')}
              </h2>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                {t('handover.subTitle')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{t('handover.docNo')}</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: '#1677ff' }}>
                SHD-20261001-A2B
              </div>
              <Tag color="green" style={{ margin: '4px 0 0 0', borderRadius: 2 }}>
                {language === 'zh-CN' ? '审核归档中' : 'Pending Custody Transfer'}
              </Tag>
            </div>
          </div>

          {/* Meta Grid */}
          <div
            style={{
              marginTop: 12,
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              fontSize: 11,
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>{t('header.workshop')}:</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {language === 'zh-CN' ? '第一车间 - 机加工与总装' : 'Workshop 01 - Heavy Machining'}
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{language === 'zh-CN' ? '交接日期与时间' : 'Shift Handover Time'}:</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>2026-10-01 16:30 (UTC+8)</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('handover.outgoingShift')}:</span>
              <div style={{ fontWeight: 600, color: '#0958d9' }}>
                {language === 'zh-CN' ? '早班 (08:00 - 16:30)' : 'Shift A (08:00 - 16:30)'}
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('handover.incomingShift')}:</span>
              <div style={{ fontWeight: 600, color: '#52c41a' }}>
                {language === 'zh-CN' ? '中班 (16:30 - 01:00)' : 'Shift B (16:30 - 01:00)'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Output & Quality Summary */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileDoneOutlined style={{ color: '#1677ff' }} />
            {t('handover.outputSummary')}
          </div>
          <Row gutter={[8, 8]}>
            <Col span={5}>
              <div style={{ padding: '8px 10px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: '#6b7280' }}>{t('handover.targetUnits')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>1,500 <span style={{ fontSize: 10 }}>pcs</span></div>
              </div>
            </Col>
            <Col span={5}>
              <div style={{ padding: '8px 10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: '#1e40af' }}>{t('handover.actualUnits')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1d4ed8' }}>1,462 <span style={{ fontSize: 10 }}>pcs</span></div>
              </div>
            </Col>
            <Col span={5}>
              <div style={{ padding: '8px 10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: '#166534' }}>{t('handover.planAttainment')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>97.5%</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ padding: '8px 10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: '#991b1b' }}>{t('handover.defectUnits')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#b91c1c' }}>14 <span style={{ fontSize: 10 }}>pcs</span> (0.95%)</div>
              </div>
            </Col>
            <Col span={5}>
              <div style={{ padding: '8px 10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: '#92400e' }}>{t('handover.wipBalance')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#b45309' }}>240 <span style={{ fontSize: 10 }}>pcs</span></div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Section 2: Machine Downtime & Incident Log */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertOutlined style={{ color: '#faad14' }} />
            {t('handover.machineIncidents')}
          </div>
          <Table
            size="small"
            pagination={false}
            columns={[
              { title: t('columns.timestamp'), dataIndex: 'time', key: 'time', width: 70 },
              { title: t('columns.workstationLine'), dataIndex: 'equipment', key: 'equipment', width: 200 },
              { title: language === 'zh-CN' ? '异常原因与处理措施' : 'Incident Details & Action Taken', dataIndex: 'incident', key: 'incident' },
              {
                title: t('columns.status'),
                dataIndex: 'status',
                key: 'status',
                width: 100,
                render: (val: string, r) => (
                  <Tag color={r.statusColor} style={{ fontSize: 10, margin: 0 }}>
                    {val}
                  </Tag>
                ),
              },
            ]}
            dataSource={incidentsData}
            style={{ border: '1px solid #e5e7eb', borderRadius: 4 }}
          />
        </div>

        {/* Section 3: 5S & Safety Handover Checklist */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <SafetyCertificateFilled style={{ color: '#52c41a' }} />
            {t('handover.safetyChecklist')}
          </div>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              fontSize: 11,
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span>
              <CheckCircleFilled style={{ color: '#52c41a', marginRight: 4 }} />
              {language === 'zh-CN' ? '工段通道与安全通道通畅无阻塞' : 'Passageways & fire aisles cleared'}
            </span>
            <span>
              <CheckCircleFilled style={{ color: '#52c41a', marginRight: 4 }} />
              {language === 'zh-CN' ? '铁屑废料箱已清空并定置标识' : 'Scrap metal bins emptied & tagged'}
            </span>
            <span>
              <CheckCircleFilled style={{ color: '#52c41a', marginRight: 4 }} />
              {language === 'zh-CN' ? '关键量检具已归位并确认校准' : 'Calibrated gauges accounted for'}
            </span>
            <span>
              <CheckCircleFilled style={{ color: '#52c41a', marginRight: 4 }} />
              {language === 'zh-CN' ? '零工伤事故 (Zero Safety Incidents)' : 'Zero Safety Incidents'}
            </span>
          </div>
        </div>

        <Divider style={{ margin: '14px 0' }} />

        {/* Section 4: Electronic Signatures & Approvals */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>
            {language === 'zh-CN' ? '交接双签与主管核准 (Electronic Signatures)' : 'Shift Lead Verification & Approval'}
          </div>
          <Row gutter={[12, 12]}>
            {/* Outgoing Lead */}
            <Col span={8}>
              <div
                style={{
                  padding: 10,
                  border: '1px solid #bfdbfe',
                  borderRadius: 4,
                  backgroundColor: '#f0f7ff',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>
                  {t('handover.outgoingSignature')}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SafetyCertificateFilled style={{ color: '#1d4ed8' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    {language === 'zh-CN' ? '张强 (工号 EMP-1002)' : 'Zhang Qiang (EMP-1002)'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                  {language === 'zh-CN' ? '电子签名时间: 16:28:14' : 'Signed: Today 16:28:14'}
                </div>
              </div>
            </Col>

            {/* Incoming Lead */}
            <Col span={8}>
              <div
                style={{
                  padding: 10,
                  border: incomingSigned ? '1px solid #bbf7d0' : '1px dashed #d1d5db',
                  borderRadius: 4,
                  backgroundColor: incomingSigned ? '#f0fdf4' : '#ffffff',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: incomingSigned ? '#166534' : '#4b5563', fontWeight: 600 }}>
                    {t('handover.incomingSignature')}
                  </div>
                  {incomingSigned ? (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircleFilled style={{ color: '#15803d' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                          {language === 'zh-CN' ? '李伟 (工号 EMP-1045)' : 'Li Wei (EMP-1045)'}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: '#166534', marginTop: 4 }}>
                        {language === 'zh-CN' ? `电子签署时间: ${signedTime}` : `Signed: ${signedTime}`}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280' }}>
                      {language === 'zh-CN' ? '等待接班领班李伟确认交接' : 'Pending signature by Li Wei'}
                    </div>
                  )}
                </div>

                {!incomingSigned && (
                  <Button
                    type="primary"
                    size="small"
                    className="no-print"
                    onClick={handleSign}
                    style={{ marginTop: 8, fontSize: 11, backgroundColor: '#52c41a' }}
                  >
                    {t('handover.signNow')}
                  </Button>
                )}
              </div>
            </Col>

            {/* Operations Director Approval */}
            <Col span={8}>
              <div
                style={{
                  padding: 10,
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                  backgroundColor: '#f8fafc',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                  {t('handover.directorApproval')}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag color="success" style={{ margin: 0, fontWeight: 700 }}>
                    APPROVED
                  </Tag>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                    {language === 'zh-CN' ? '工厂生产总监办' : 'Plant Operations Office'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                  WIFIM-MES-SEC-CERT: #8841-A9
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Print notice footer */}
        <div
          className="no-print"
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 11,
            color: '#9ca3af',
          }}
        >
          {t('handover.printNotice')}
        </div>
      </div>
    </Modal>
  );
};

export default ShiftHandoverModal;
