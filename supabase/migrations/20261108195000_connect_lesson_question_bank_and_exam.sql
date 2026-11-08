-- Connect the published lesson question bank to the student interface.
-- Keep answer keys server-side; the public RPC returns option IDs and labels only.

CREATE OR REPLACE FUNCTION public.academy_get_lesson_questions(p_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.topics t ON t.id=l.topic_id
    JOIN public.departments d ON d.id=t.department_id
    WHERE l.id=p_lesson_id AND l.status='published'
      AND l.is_free=true AND t.is_published=true AND d.is_published=true
  ) THEN
    RAISE EXCEPTION 'المحاضرة غير منشورة أو غير متاحة';
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id',q.id,
      'question',q.question_en,
      'question_ar',q.question_ar,
      'difficulty',q.difficulty,
      'options',(SELECT jsonb_agg(
        jsonb_build_object('id',o.id,'text',o.option_en,'text_ar',o.option_ar)
        ORDER BY o.display_order
      ) FROM public.question_options o WHERE o.question_id=q.id)
    ) ORDER BY q.created_at,q.id
  ),'[]'::jsonb)
  INTO v_result
  FROM public.questions q
  WHERE q.lesson_id=p_lesson_id AND q.is_published=true;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.academy_check_lesson_answer(p_question_id uuid,p_option_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_correct boolean; v_correct_text text; v_explanation text; v_explanation_ar text;
BEGIN
  SELECT o.is_correct, o.option_en, q.explanation_en, q.explanation_ar
  INTO v_correct,v_correct_text,v_explanation,v_explanation_ar
  FROM public.questions q
  JOIN public.lessons l ON l.id=q.lesson_id
  JOIN public.topics t ON t.id=l.topic_id
  JOIN public.departments d ON d.id=t.department_id
  JOIN public.question_options o ON o.question_id=q.id
  WHERE q.id=p_question_id AND o.id=p_option_id
    AND q.is_published=true AND l.status='published'
    AND l.is_free=true AND t.is_published=true AND d.is_published=true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'السؤال أو الخيار غير متاح';
  END IF;

  RETURN jsonb_build_object(
    'is_correct',COALESCE(v_correct,false),
    'correct_answer',v_correct_text,
    'explanation_en',v_explanation,
    'explanation_ar',v_explanation_ar
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.academy_get_lesson_questions(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.academy_check_lesson_answer(uuid,uuid) TO anon, authenticated;

-- A logged-in learner can sit the final department exam without an artificial
-- requirement to mark every lesson complete first. Completion tracking remains available.
CREATE OR REPLACE FUNCTION public.academy_start_exam(p_department_code text, p_question_count integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user uuid;
    v_question_ids uuid[];
    v_question_count integer;
    v_attempt_id uuid;
    v_questions jsonb;
BEGIN
    v_user := auth.uid();
    IF v_user IS NULL THEN
        RAISE EXCEPTION 'يجب تسجيل الدخول أولاً';
    END IF;
    IF p_question_count < 1 OR p_question_count > 100 THEN
        RAISE EXCEPTION 'عدد الأسئلة غير صالح';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.departments d
      WHERE d.code=p_department_code AND d.is_published=true
    ) THEN
      RAISE EXCEPTION 'القسم غير منشور أو غير موجود';
    END IF;

    SELECT array_agg(q.id),count(*)
    INTO v_question_ids,v_question_count
    FROM (
      SELECT id
      FROM public.academy_exam_questions
      WHERE department_code=p_department_code AND is_active=true
      ORDER BY random()
      LIMIT p_question_count
    ) q;

    IF COALESCE(v_question_count,0)<p_question_count THEN
      RAISE EXCEPTION 'بنك الأسئلة غير مكتمل. المتاح % والمطلوب %',
        COALESCE(v_question_count,0),p_question_count;
    END IF;

    INSERT INTO public.academy_exam_attempts(user_id,department_code,question_ids,total_questions)
    VALUES(v_user,p_department_code,v_question_ids,v_question_count)
    RETURNING id INTO v_attempt_id;

    SELECT jsonb_agg(
      jsonb_build_object('id',q.id,'question',q.question_text,'options',q.options)
    )
    INTO v_questions
    FROM public.academy_exam_questions q
    WHERE q.id=ANY(v_question_ids);

    RETURN jsonb_build_object(
      'attempt_id',v_attempt_id,
      'department_code',p_department_code,
      'total_questions',v_question_count,
      'pass_mark',70,
      'questions',COALESCE(v_questions,'[]'::jsonb)
    );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.academy_start_exam(text,integer) TO authenticated;
