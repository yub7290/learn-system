-- 章节附件表
CREATE TABLE edu_chapter_attachment (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  chapter_id  BIGINT       NOT NULL COMMENT '章节ID',
  file_name   VARCHAR(255) NOT NULL COMMENT '原始文件名',
  file_url    VARCHAR(500) NOT NULL COMMENT '文件存储URL',
  file_size   BIGINT       DEFAULT 0 COMMENT '文件大小（字节）',
  file_type   VARCHAR(50)  DEFAULT '' COMMENT '文件扩展名',
  sort        INT          DEFAULT 0 COMMENT '排序',
  create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by   BIGINT       DEFAULT NULL COMMENT '上传人',
  deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '0正常 1已删除',
  INDEX idx_chapter_id (chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='章节附件';
