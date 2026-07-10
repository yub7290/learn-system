-- 资金明细功能建表脚本

-- 用户资金账户
CREATE TABLE edu_fund_account (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    balance         DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '可用余额',
    total_recharge  DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '累计充值',
    total_consumption DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '累计消费',
    version         INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0=正常 1=已删除'
) COMMENT='用户资金账户';

-- 资金交易记录
CREATE TABLE edu_fund_transaction (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id           BIGINT NOT NULL COMMENT '用户ID',
    transaction_type  VARCHAR(20) NOT NULL COMMENT '交易类型: RECHARGE/COURSE_PURCHASE/REFUND',
    amount            DECIMAL(10,2) NOT NULL COMMENT '金额(正=收入, 负=支出)',
    balance_after     DECIMAL(10,2) NOT NULL COMMENT '交易后余额快照',
    related_id        VARCHAR(64) DEFAULT NULL COMMENT '关联业务ID',
    description       VARCHAR(200) DEFAULT NULL COMMENT '交易描述',
    create_time       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted           INT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_user_time (user_id, create_time)
) COMMENT='资金交易记录';

-- 支付订单
CREATE TABLE edu_payment_order (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no          VARCHAR(64) NOT NULL UNIQUE COMMENT '平台订单号',
    user_id           BIGINT NOT NULL COMMENT '用户ID',
    payment_channel   VARCHAR(20) NOT NULL COMMENT '支付渠道: WECHAT_H5',
    amount            DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    status            INT NOT NULL DEFAULT 0 COMMENT '0=待支付 1=支付中 2=已支付 3=已关闭',
    channel_order_no  VARCHAR(64) DEFAULT NULL COMMENT '渠道方订单号',
    paid_at           DATETIME DEFAULT NULL COMMENT '支付完成时间',
    expire_at         DATETIME NOT NULL COMMENT '订单过期时间',
    create_time       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted           INT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_user_status (user_id, status)
) COMMENT='支付订单';

-- 课程订单
CREATE TABLE edu_course_order (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no        VARCHAR(64) NOT NULL UNIQUE COMMENT '平台订单号',
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    course_id       BIGINT NOT NULL COMMENT '课程ID',
    course_name     VARCHAR(200) NOT NULL COMMENT '课程名称',
    amount          DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    payment_method  VARCHAR(20) NOT NULL COMMENT '支付方式: BALANCE/WECHAT/FREE',
    status          INT NOT NULL DEFAULT 0 COMMENT '0=待支付 1=已支付 2=已退款 3=已关闭',
    refund_amount   DECIMAL(10,2) DEFAULT NULL COMMENT '退款金额',
    paid_at         DATETIME DEFAULT NULL COMMENT '支付时间',
    refunded_at     DATETIME DEFAULT NULL COMMENT '退款时间',
    create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_user_status (user_id, status),
    INDEX idx_course (course_id)
) COMMENT='课程订单';
