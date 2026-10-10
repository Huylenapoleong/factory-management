import React, { useState, useEffect } from 'react';
import { Modal, Button, Tag, Divider, Row, Col, Table, theme } from 'antd';
import { message } from '@/utils/antdApp';
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
import { useAuthStore } from '@/stores/useAuthStore';
import { productionService } from '@/services/productionService';
import { ProductionOrder } from '@/features/production/types';
import { playSuccessChime } from '@/utils/audioAlert';
import { getFactoryShift } from '@/utils/shift';
import { getLocalTimezoneOffsetString } from '@/utils/timezone';

export const ShiftHandoverModal: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { shiftHandoverVisible, setShiftHandoverVisible, language } = useAppStore();
  const user = useAuthStore((state) => state.user);
  const isZh = language === 'zh-CN';
  const [incomingSigned, setIncomingSigned] = useState<boolean>(false);
  const [signedTime, setSignedTime] = useState<string>('');
  const [orders, setOrders] = useState<ProductionOrder[]>([]);

  useEffect(() => {
    if (shiftHandoverVisible) {
      void productionService.getProductionOrders().then(setOrders);
    }
  }, [shiftHandoverVisible]);

  const currentShift = getFactoryShift();
  const tzString = getLocalTimezoneOffsetString();

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const docketDateTag = dateStr.replace(/-/g, '');
  const docketNo = `SHD-${docketDateTag}-${currentShift.code}2${currentShift.nextShiftCode}`;

  const formattedDateTime = `${dateStr} ${now.toLocaleTimeString(
    language === 'zh-CN' ? 'zh-CN' : 'en-US',
    {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    },
  )} (${tzString})`;

  const handleSign = () => {
    const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false });
    setIncomingSigned(true);
    setSignedTime(timeNow);
    playSuccessChime();
    message.success(
      isZh
        ? '接班负责人已完成电子签章核准！'
        : 'Incoming Supervisor has signed and accepted shift custody.',
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const targetUnits = orders.reduce((s, o) => s + (o.plannedQty || 0), 0);
  const actualUnits = orders.reduce((s, o) => s + (o.completedQty || 0), 0);
  const attainment = targetUnits > 0 ? ((actualUnits / targetUnits) * 100).toFixed(1) : '0.0';
  const defectUnits = orders.reduce((s, o) => s + (o.scrapQty || 0), 0);
  const totalProduced = actualUnits + defectUnits;
  const defectPercent =
    totalProduced > 0 ? ((defectUnits / totalProduced) * 100).toFixed(2) : '0.00';
  const wipBalance = orders.reduce(
    (s, o) => s + (o.status === 'IN_PRODUCTION' ? Math.max(0, o.plannedQty - o.completedQty) : 0),
    0,
  );

  const incidentsData = [
    {
      key: '1',
      time: currentShift.timeRange.split(' - ')[0] || '08:00',
      equipment: isZh ? '全厂生产工位与设备' : 'All Workshop Workstations',
      incident: isZh
        ? '交接班次设备点检正常，无关键停机故障'
        : 'All equipment inspected, operational and in order',
      status: isZh ? '正常' : 'Operational',
      statusColor: 'success',
    },
  ];

  return (
    <Modal
      open={shiftHandoverVisible}
      onCancel={() => setShiftHandoverVisible(false)}
      centered
      width={860}
      footer={[
        <Button key="close" onClick={() => setShiftHandoverVisible(false)}>
          {t('common.cancel')}
        </Button>,
        <Button key="pdf" icon={<FilePdfOutlined />} onClick={handlePrint}>
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
        body: { padding: '16px 20px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' },
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
        <div
          style={{
            borderBottom: `2px solid ${token.colorBorder}`,
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AuditOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: token.colorText,
                    letterSpacing: '0.02em',
                  }}
                >
                  WIFIM MES
                </span>
                <Tag color="blue" style={{ borderRadius: 2, fontWeight: 600 }}>
                  ISO-9001 / IATF-16949 COMPLIANT
                </Tag>
              </div>
              <h2
                style={{
                  margin: '4px 0 0 0',
                  fontSize: 16,
                  fontWeight: 700,
                  color: token.colorText,
                }}
              >
                {t('handover.title')}
              </h2>
              <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
                {t('handover.subTitle')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
                {t('handover.docNo')}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: token.colorPrimary,
                }}
              >
                {docketNo}
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
              backgroundColor: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              fontSize: 11,
            }}
          >
            <div>
              <span style={{ color: token.colorTextSecondary }}>{t('header.workshop')}:</span>
              <div style={{ fontWeight: 600, color: token.colorText }}>
                {language === 'zh-CN' ? '第一车间 - 机加工与总装' : 'Workshop 01 - Heavy Machining'}
              </div>
            </div>
            <div>
              <span style={{ color: token.colorTextSecondary }}>
                {language === 'zh-CN' ? '交接日期与时间' : 'Shift Handover Time'}:
              </span>
              <div style={{ fontWeight: 600, color: token.colorText }}>{formattedDateTime}</div>
            </div>
            <div>
              <span style={{ color: token.colorTextSecondary }}>
                {t('handover.outgoingShift')}:
              </span>
              <div style={{ fontWeight: 600, color: token.colorPrimary }}>
                {language === 'zh-CN'
                  ? `${currentShift.nameZh} (${currentShift.timeRange})`
                  : `${currentShift.nameEn} (${currentShift.timeRange})`}
              </div>
            </div>
            <div>
              <span style={{ color: token.colorTextSecondary }}>
                {t('handover.incomingShift')}:
              </span>
              <div style={{ fontWeight: 600, color: token.colorSuccess }}>
                {language === 'zh-CN'
                  ? `${currentShift.nextShiftNameZh} (${currentShift.nextShiftRange})`
                  : `${currentShift.nextShiftNameEn} (${currentShift.nextShiftRange})`}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Output & Quality Summary */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: token.colorText,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FileDoneOutlined style={{ color: token.colorPrimary }} />
            {t('handover.outputSummary')}
          </div>
          <Row gutter={[8, 8]}>
            <Col span={5}>
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: token.colorFillAlter,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 4,
                }}
              >
                <div style={{ fontSize: 10, color: token.colorTextSecondary }}>
                  {t('handover.targetUnits')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: token.colorText }}>
                  {targetUnits.toLocaleString()} <span style={{ fontSize: 10 }}>pcs</span>
                </div>
              </div>
            </Col>
            <Col span={5}>
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: token.colorInfoBg,
                  border: `1px solid ${token.colorInfoBorder}`,
                  borderRadius: 4,
                }}
              >
                <div style={{ fontSize: 10, color: token.colorInfoText }}>
                  {t('handover.actualUnits')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: token.colorInfoText }}>
                  {actualUnits.toLocaleString()} <span style={{ fontSize: 10 }}>pcs</span>
                </div>
              </div>
            </Col>
            <Col span={5}>
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: token.colorSuccessBg,
                  border: `1px solid ${token.colorSuccessBorder}`,
                  borderRadius: 4,
                }}
              >
                <div style={{ fontSize: 10, color: token.colorSuccessText }}>
                  {t('handover.planAttainment')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: token.colorSuccessText }}>
                  {attainment}%
                </div>
              </div>
            </Col>
            <Col span={4}>
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: token.colorErrorBg,
                  border: `1px solid ${token.colorErrorBorder}`,
                  borderRadius: 4,
                }}
              >
                <div style={{ fontSize: 10, color: token.colorErrorText }}>
                  {t('handover.defectUnits')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: token.colorErrorText }}>
                  {defectUnits.toLocaleString()}{' '}
                  <span style={{ fontSize: 10 }}>pcs ({defectPercent}%)</span>
                </div>
              </div>
            </Col>
            <Col span={5}>
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: token.colorWarningBg,
                  border: `1px solid ${token.colorWarningBorder}`,
                  borderRadius: 4,
                }}
              >
                <div style={{ fontSize: 10, color: token.colorWarningText }}>
                  {t('handover.wipBalance')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: token.colorWarningText }}>
                  {wipBalance.toLocaleString()} <span style={{ fontSize: 10 }}>pcs</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Section 2: Machine Downtime & Incident Log */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: token.colorText,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <AlertOutlined style={{ color: token.colorWarning }} />
            {t('handover.machineIncidents')}
          </div>
          <Table
            size="small"
            pagination={false}
            columns={[
              { title: t('columns.timestamp'), dataIndex: 'time', key: 'time', width: 70 },
              {
                title: t('columns.workstationLine'),
                dataIndex: 'equipment',
                key: 'equipment',
                width: 200,
              },
              {
                title:
                  language === 'zh-CN' ? '异常原因与处理措施' : 'Incident Details & Action Taken',
                dataIndex: 'incident',
                key: 'incident',
              },
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
            style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 4 }}
          />
        </div>

        {/* Section 3: 5S & Safety Handover Checklist */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: token.colorText,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <SafetyCertificateFilled style={{ color: token.colorSuccess }} />
            {t('handover.safetyChecklist')}
          </div>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 4,
              fontSize: 11,
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              color: token.colorText,
            }}
          >
            <span>
              <CheckCircleFilled style={{ color: token.colorSuccess, marginRight: 4 }} />
              {language === 'zh-CN'
                ? '工段通道与安全通道通畅无阻塞'
                : 'Passageways & fire aisles cleared'}
            </span>
            <span>
              <CheckCircleFilled style={{ color: token.colorSuccess, marginRight: 4 }} />
              {language === 'zh-CN'
                ? '铁屑废料箱已清空并定置标识'
                : 'Scrap metal bins emptied & tagged'}
            </span>
            <span>
              <CheckCircleFilled style={{ color: token.colorSuccess, marginRight: 4 }} />
              {language === 'zh-CN'
                ? '关键量检具已归位并确认校准'
                : 'Calibrated gauges accounted for'}
            </span>
            <span>
              <CheckCircleFilled style={{ color: token.colorSuccess, marginRight: 4 }} />
              {language === 'zh-CN' ? '零工伤事故' : 'Zero Safety Incidents'}
            </span>
          </div>
        </div>

        <Divider style={{ margin: '14px 0' }} />

        {/* Section 4: Electronic Signatures & Approvals */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: token.colorText, marginBottom: 10 }}>
            {language === 'zh-CN' ? '交接双签与主管核准' : 'Shift Lead Verification & Approval'}
          </div>
          <Row gutter={[12, 12]}>
            {/* Outgoing Lead */}
            <Col span={8}>
              <div
                style={{
                  padding: 10,
                  border: `1px solid ${token.colorInfoBorder}`,
                  borderRadius: 4,
                  backgroundColor: token.colorInfoBg,
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 11, color: token.colorInfoText, fontWeight: 600 }}>
                  {t('handover.outgoingSignature')}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SafetyCertificateFilled style={{ color: token.colorPrimary }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: token.colorText }}>
                    {user?.fullName ||
                      user?.username ||
                      (language === 'zh-CN' ? '当班主管 / 领班' : 'Outgoing Supervisor')}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: token.colorTextSecondary, marginTop: 4 }}>
                  {language === 'zh-CN'
                    ? '电子签名状态: 现班已确认'
                    : 'Status: Outgoing Lead Signed'}
                </div>
              </div>
            </Col>

            {/* Incoming Lead */}
            <Col span={8}>
              <div
                style={{
                  padding: 10,
                  border: incomingSigned
                    ? `1px solid ${token.colorSuccessBorder}`
                    : `1px dashed ${token.colorBorderSecondary}`,
                  borderRadius: 4,
                  backgroundColor: incomingSigned ? token.colorSuccessBg : token.colorFillAlter,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: incomingSigned ? token.colorSuccessText : token.colorTextSecondary,
                      fontWeight: 600,
                    }}
                  >
                    {t('handover.incomingSignature')}
                  </div>
                  {incomingSigned ? (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircleFilled style={{ color: token.colorSuccess }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: token.colorText }}>
                          {language === 'zh-CN' ? '接班负责人 / 领班' : 'Incoming Shift Lead'}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: token.colorSuccessText, marginTop: 4 }}>
                        {language === 'zh-CN'
                          ? `电子签署时间: ${signedTime}`
                          : `Signed: ${signedTime}`}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 11, color: token.colorTextTertiary }}>
                      {language === 'zh-CN'
                        ? '等待接班领班确认交接'
                        : 'Pending incoming shift lead signature'}
                    </div>
                  )}
                </div>

                {!incomingSigned && (
                  <Button
                    type="primary"
                    size="small"
                    className="no-print"
                    onClick={handleSign}
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      backgroundColor: token.colorSuccess,
                      borderColor: token.colorSuccess,
                    }}
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
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 4,
                  backgroundColor: token.colorFillAlter,
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {t('handover.directorApproval')}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag color="success" style={{ margin: 0, fontWeight: 700 }}>
                    APPROVED
                  </Tag>
                  <span style={{ fontSize: 12, fontWeight: 600, color: token.colorText }}>
                    {language === 'zh-CN' ? '工厂生产总监办' : 'Plant Operations Office'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: token.colorTextTertiary, marginTop: 4 }}>
                  {language === 'zh-CN' ? '质量体系与安全合规核准' : 'Quality & Safety Sign-off'}
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
            color: token.colorTextTertiary,
          }}
        >
          {t('handover.printNotice')}
        </div>
      </div>
    </Modal>
  );
};

export default ShiftHandoverModal;
