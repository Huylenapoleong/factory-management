import React, { useEffect, useMemo } from 'react';
import { App, Button, Popconfirm, Skeleton, Upload, theme } from 'antd';
import { DeleteOutlined, PictureOutlined, SwapOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bomService } from '@/services/bomService';
import type { BomAnalysis } from '../types';

interface ProductImagePanelProps {
  analysis: BomAnalysis;
  isZh: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp';

export const ProductImagePanel: React.FC<ProductImagePanelProps> = ({ analysis, isZh }) => {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const productId = analysis.productId;
  const version = analysis.productImageVersion ?? null;

  const imageQuery = useQuery({
    queryKey: ['item-image', productId, version],
    queryFn: () => bomService.getItemImage(productId),
    enabled: version !== null,
    staleTime: Infinity,
  });

  const objectUrl = useMemo(() => (imageQuery.data ? URL.createObjectURL(imageQuery.data) : null), [imageQuery.data]);
  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['bom-analysis'] });
  const errorText = (err: unknown, fallback: string) => (err as { message?: string })?.message || fallback;

  const upload = useMutation({
    mutationFn: (file: File) => bomService.uploadItemImage(productId, file),
    onSuccess: () => {
      message.success(isZh ? '已保存产品图片' : 'Product image saved');
      refresh();
    },
    onError: (err) => message.error(errorText(err, isZh ? '图片上传失败' : 'Could not upload image')),
  });

  const remove = useMutation({
    mutationFn: () => bomService.deleteItemImage(productId),
    onSuccess: () => {
      message.success(isZh ? '已删除产品图片' : 'Product image removed');
      refresh();
    },
    onError: (err) => message.error(errorText(err, isZh ? '删除失败' : 'Could not remove image')),
  });

  const beforeUpload = (file: File) => {
    if (!ACCEPT.split(',').includes(file.type)) {
      message.error(isZh ? '仅支持 PNG、JPG、WEBP 图片' : 'Only PNG, JPG or WEBP images are supported');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_BYTES) {
      message.error(isZh ? '图片不能超过 5 MB' : 'Image must be 5 MB or smaller');
      return Upload.LIST_IGNORE;
    }
    upload.mutate(file);
    return false;
  };

  const productName = (isZh && analysis.productNameZh) || analysis.productNameEn;

  if (version !== null && (imageQuery.isLoading || !objectUrl)) {
    return (
      <div className="bom-image-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton.Image active style={{ width: 200, height: 200 }} />
      </div>
    );
  }

  if (objectUrl) {
    return (
      <div className="bom-image-panel" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            flexGrow: 1,
            minHeight: 220,
            borderRadius: token.borderRadiusLG,
            background: token.colorFillQuaternary,
            border: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img src={objectUrl} alt={productName} style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Upload accept={ACCEPT} showUploadList={false} beforeUpload={beforeUpload} style={{ flexGrow: 1 }}>
            <Button size="small" icon={<SwapOutlined />} loading={upload.isPending} block>
              {isZh ? '更换图片' : 'Replace'}
            </Button>
          </Upload>
          <Popconfirm
            title={isZh ? '删除产品图片？' : 'Remove the product image?'}
            okText={isZh ? '删除' : 'Remove'}
            cancelText={isZh ? '取消' : 'Cancel'}
            okButtonProps={{ danger: true }}
            onConfirm={() => remove.mutate()}
          >
            <Button size="small" danger icon={<DeleteOutlined />} loading={remove.isPending} aria-label={isZh ? '删除图片' : 'Remove image'} />
          </Popconfirm>
        </div>
      </div>
    );
  }

  return (
    <div className="bom-image-panel" style={{ display: 'flex' }}>
      <Upload.Dragger
        accept={ACCEPT}
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={upload.isPending}
        style={{ padding: '18px 12px' }}
        rootClassName="bom-image-dragger"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: token.borderRadiusLG,
              background: token.colorPrimaryBg,
              color: token.colorPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            <PictureOutlined />
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: token.colorText }}>
            {isZh ? '添加产品图片' : 'Add a product image'}
          </span>
          <span style={{ fontSize: 12, color: token.colorTextSecondary, lineHeight: 1.5 }}>
            {isZh ? '照片或图纸 · PNG、JPG、WEBP · 最大 5 MB' : 'Photo or drawing · PNG, JPG, WEBP · up to 5 MB'}
          </span>
          <Button type="primary" size="small" icon={<UploadOutlined />} loading={upload.isPending}>
            {isZh ? '上传图片' : 'Upload'}
          </Button>
          <span style={{ fontSize: 11, color: token.colorTextTertiary }}>{isZh ? '或拖放到此处' : 'or drop a file here'}</span>
        </div>
      </Upload.Dragger>
    </div>
  );
};
