create table t_residential_area(
    id  uuid NOT NULL default uuid_generate_v4(), --index
    section text,
    serial text,
    name text,
    position text,
    lnglat point,
    category INTEGER,
    live_size text,
    parking_num INTEGER,
    location text,
    avg_daily_traffic INTEGER,
    advertise_id text, --index
    update_time timestamp with time zone DEFAULT now(),
    is_realestate BOOLEAN,
    is_exclusive BOOLEAN,
     PRIMARY KEY (id)
);

create table t_advertise(
    id  uuid NOT NULL default uuid_generate_v4(), --index
    name text,
    co_id text, --index
    location text,
    lease_time INTEGER,
    lease_time_unit INTEGER,     -- 0-h, 1-day, 2-week , 3-mon, 4-year
    size text[],
    update_time timestamp with time zone,
     PRIMARY KEY (id)
);

create table t_co(
    id uuid not null default uuid_generate_v4(), -- index
    name text,
    update_time timestamp with time zone,
    contact text,
    phone text,
    address text,
    PRIMARY KEY (id)
);

CREATE unique INDEX idx_co_uni on t_co(name);

--  小区所有广告位 ？
create table t_area_advt_space(
    id uuid not null default uuid_generate_v4(), -- index
    area_id text NOT NULL,
    area_name text,
    area_location text,

    advt_id text,
    advt_name text,

    co_id text,
    co_name text,

    expire_time timestamp with time zone,
    -- 广告位位置
    advt_space_position text,
    advt_space_position_des text,
    section text,
    is_exclusive BOOLEAN,
    -- 广告位地点
    advt_space_location text,
    update_time timestamp with time zone DEFAULT now(),
  --  广告位图片
    advt_position_image text,
    --  是否被租
    isRented INTEGER DEFAULT 0,
    is_realestate BOOLEAN DEFAULT false,
    light_size text[],
    PRIMARY KEY (id)
);


create table t_setting(
    id uuid not null default uuid_generate_v4(), -- index
    name text,
    email text,
    email_code text,
    update_time timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
-- 方案表
create table t_plan(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    plan_name text not null,
    co_id text
);

-- 企业方案关联表？
create table t_co_advt_plan(
    id uuid not null DEFAULT uuid_generate_v4(),
    plan_name text not null, 
    plan_id text, -- plan 表的id
    co_id text,
    co_name text,
    advt_space_id text,
    
    section text,
    area_name text,
    area_location text,
    advt_space_position text,
    advt_space_position_des text,
    isrented INTEGER DEFAULT 0,
    update_time timestamp with time zone DEFAULT now()
);

-- 方案 区域 关联表

create table t_plan_section(
    id uuid not null DEFAULT uuid_generate_v4(),
    plan_id text, -- plan 表的id
    section text,
    update_time timestamp with time zone DEFAULT now()
);



CREATE INDEX idx_advt_space_position
    ON public.t_area_advt_space USING btree
    (advt_space_position ASC NULLS LAST);
