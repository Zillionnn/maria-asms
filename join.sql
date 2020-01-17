select A.name,A.id,A.section,A.position, A.live_size,A.parking_num, A.avg_daily_traffic,A.update_time,A.is_exclusive,count(B.area_id) as total from t_residential_area A join t_area_advt_space B on(B.area_id=A.id::text)
-- join tbl_course using(course_id) 
group by name, A.id, A.section,position,live_size,A.parking_num,A.avg_daily_traffic,A.update_time, A.is_exclusive offset 0 limit 10;