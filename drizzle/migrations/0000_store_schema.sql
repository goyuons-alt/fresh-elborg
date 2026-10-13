CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'admin'); END IF;
  INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.products (id text PRIMARY KEY, category text NOT NULL, name text NOT NULL, name_en text, weight text NOT NULL DEFAULT '', price numeric(10,2) NOT NULL, old_price numeric(10,2), image_url text, sales_count int NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.products TO anon, authenticated; GRANT UPDATE, INSERT, DELETE ON public.products TO authenticated; GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text),1,6)), user_id uuid, customer_name text NOT NULL, phone text NOT NULL, address text NOT NULL, items jsonb NOT NULL, total numeric(10,2) NOT NULL, payment_method text NOT NULL DEFAULT 'cod', status text NOT NULL DEFAULT 'new', driver text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE ON public.orders TO authenticated; GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.track_order(_code text) RETURNS TABLE(code text, status text, driver text, total numeric, created_at timestamptz, customer_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT o.code,o.status,o.driver,o.total,o.created_at,o.customer_name FROM public.orders o WHERE o.code=upper(_code) $$;
GRANT EXECUTE ON FUNCTION public.track_order(text) TO anon, authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

INSERT INTO public.products (id,category,name,weight,price,old_price,sales_count) VALUES
('offer-1','offers','عرض المدارس من فريش (كيلو بيف برجر فريش 20 قطعة)','1 كيلو',230.00,275.00,11),
('offer-2','offers','عرض الشاورما وعيش سوري (400 جرام شاورما دجاج سو جود متبل)','400 جرام + عيش',125.00,145.00,10),
('cheese-1','cheese','موتزاريلا الحريف طبيعي 100%','1 كيلو',180.00,NULL,9),
('cheese-2','cheese','موتزاريلا الحريف طبيعي 100%','400 جرام',80.00,NULL,8),
('cheese-3','cheese','موتزاريلا فريش إكسترا','1 كيلو',140.00,NULL,7),
('cheese-4','cheese','موتزاريلا فريش إكسترا','400 جرام',60.00,NULL,6),
('cheese-5','cheese','ميكس جبن موتزاريلا فريش','1 كيلو',120.00,NULL,5),
('cheese-6','cheese','ميكس جبن موتزاريلا فريش','400 جرام',56.00,NULL,4),
('cheese-7','cheese','موتزاريلا نيو','200 جرام',30.00,NULL,3),
('cheese-8','cheese','مشلله سوري طبيعي','400 جرام',80.00,NULL,2),
('cheese-9','cheese','عرض 4 علب جبن عرب لاند','420 جرام لكل علبه',130.00,NULL,1),
('cheese-10','cheese','كسر تركي المروه','1 كيلو',135.00,NULL,0),
('cheese-11','cheese','ميكس جبن موتزاريلا فريش','200 جرام',29.00,NULL,16),
('sauce-1','sauces','صوص باربكيو الطيبات','400 جرام',45.00,NULL,15),
('sauce-2','sauces','كاتشب الما حار','1 كيلو',65.00,NULL,14),
('sauce-3','sauces','صويا صوص الطيبات','400 جرام',45.00,NULL,13),
('sauce-4','sauces','ايلو كاتشب بارد','400 جرام',50.00,NULL,12),
('sauce-5','sauces','ايلو كاتشب بارد','200 جرام',35.00,NULL,11),
('sauce-6','sauces','مايونيز ايلو','400 جرام',55.00,NULL,10),
('sauce-7','sauces','دبس رمان الطيبات صويا صوص','400 جرام',45.00,NULL,9),
('sauce-8','sauces','صوص تايجر (سبايسي)','400 جرام',50.00,NULL,8),
('sauce-9','sauces','باربكيو ايلو','400 جرام',50.00,NULL,7),
('sauce-10','sauces','مستردة ايلو','400 جرام',50.00,NULL,6),
('sauce-11','sauces','تكساس برجر (بيج تيستي)','200 جرام',60.00,NULL,5),
('sauce-12','sauces','الف جزيره','200 جرام',45.00,NULL,4),
('sauce-13','sauces','صوص شيدر ميلكى','200 جرام',52.00,NULL,3),
('sauce-14','sauces','كاتشب الما بارد','1 كيلو',65.00,NULL,2),
('sauce-15','sauces','ايلو مايونيز','200 جرام',40.00,NULL,1),
('sauce-16','sauces','صوص الرانش من ايلو','200 جرام',45.00,NULL,0),
('sauce-17','sauces','سويت شيلي من ايلو','200 جرام',35.00,NULL,16),
('sauce-18','sauces','ميلكانا باكيت','330 جرام',5.00,NULL,15),
('sauce-19','sauces','سويت شيلى صوص','400 جرام',50.00,NULL,14),
('meat-1','meat','استريبس ولعتين حار','1 كيلو',285.00,NULL,13),
('meat-2','meat','اسكالوب ولعتين حار','1 كيلو',290.00,NULL,12),
('meat-3','meat','استريبس ميزة بارد','900 جرام',230.00,NULL,11),
('meat-4','meat','استريبس اطياب بارد','1 كيلو',195.00,NULL,10),
('meat-5','meat','استريبس اطياب حار','1 كيلو',195.00,NULL,9),
('meat-6','meat','برجر جاست فروزن 10 قطع جامبو','جاهز طهي',245.00,NULL,8),
('meat-7','meat','كفته جاست فروزن','800 جرام',245.00,NULL,7),
('meat-8','meat','برجر ميتكو 20 قطعه','1 كيلو',215.00,NULL,6),
('meat-9','meat','شرايح تركي مدخن سوري','200 جرام',65.00,NULL,5),
('meat-10','meat','نقانق لحم سوري','500 جرام',80.00,NULL,4),
('meat-11','meat','برجر جاست فروزن ميني 20 قطعه','جاهز طهي',245.00,NULL,3),
('meat-12','meat','برجر جاست فروزن جبنه 7 قطع جامبو','محشي جبن',265.00,NULL,2),
('meat-13','meat','حلقات بصل كرسبي اسمارت','1 كيلو',115.00,NULL,1),
('meat-14','meat','وجبه الوطنيه 12 قطعه + بطاطس هديه','12 قطعه',185.00,NULL,0),
('meat-15','meat','كوردن بلو اسمارت','1 كيلو',195.00,NULL,16),
('meat-16','meat','شاورما فراخ متبله حاد','400 جرام',100.00,NULL,15),
('meat-17','meat','كفته جاست فروزن مطهي بالكامل','400 جرام',120.00,NULL,14),
('meat-18','meat','اسكالوب ولعتين بارد','1 كيلو',290.00,NULL,13),
('meat-19','meat','اجنحه دجاج كرسبى شهد','600 جرام',95.00,NULL,12),
('meat-20','meat','بيف برجر فريش 20 قطعه','1 كيلو',225.00,NULL,11),
('meat-21','meat','برجر سوبر فرايز من 8 لـ 10 قطع جامبو','جاهز طهي',220.00,NULL,10),
('pastry-1','pastry','عيش كيزر مضلع 4.5 بوصه','6 قطع',55.00,NULL,9),
('pastry-2','pastry','سمبوسك الحريف','450 جرام',31.00,NULL,8),
('pastry-3','pastry','كيس عيش سورى','10 قطع',35.00,NULL,7),
('pastry-4','pastry','جلاش الحريف','450 جرام',23.00,NULL,6),
('sweet-1','sweets','اكلير كراميل محشى شيكولاته','500 جرام',80.00,NULL,5),
('sweet-2','sweets','سما شيكولاته بالحليب خام','200 جرام',45.00,NULL,4),
('sweet-3','sweets','سما شيكولاته بيضا','200 جرام',40.00,NULL,3),
('sweet-4','sweets','مربى نافى فراوله','400 جرام',35.00,NULL,2),
('sweet-5','sweets','مربى نافى تين','400 جرام',35.00,NULL,1);

CREATE OR REPLACE FUNCTION public.place_order(_name text,_phone text,_address text,_items jsonb,_payment text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _total numeric := 0; _it jsonb; _p numeric; _code text;
BEGIN
  IF length(coalesce(_name,''))<2 OR length(coalesce(_phone,''))<6 OR length(coalesce(_address,''))<4 THEN RAISE EXCEPTION 'invalid'; END IF;
  IF _payment NOT IN ('cod','card') THEN RAISE EXCEPTION 'invalid payment'; END IF;
  FOR _it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    SELECT price INTO _p FROM products WHERE id=_it->>'id';
    IF _p IS NULL THEN RAISE EXCEPTION 'bad product'; END IF;
    _total := _total + _p * least(99,greatest(1,(_it->>'qty')::int));
  END LOOP;
  IF _total = 0 THEN RAISE EXCEPTION 'empty'; END IF;
  INSERT INTO orders(user_id,customer_name,phone,address,items,total,payment_method) VALUES (auth.uid(),_name,_phone,_address,_items,_total,_payment) RETURNING code INTO _code;
  UPDATE products SET sales_count=sales_count+1 WHERE id IN (SELECT x->>'id' FROM jsonb_array_elements(_items) x);
  RETURN _code;
END $$;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,jsonb,text) TO anon, authenticated;