--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1
-- Dumped by pg_dump version 13.3

-- Started on 2022-04-28 01:52:28

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: nest_transact_user
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO nest_transact_user;

--
-- TOC entry 3007 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: nest_transact_user
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 201 (class 1259 OID 16387)
-- Name: purse; Type: TABLE; Schema: public; Owner: nest_transact_user
--

CREATE TABLE public.purse (
    id integer NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.purse OWNER TO nest_transact_user;

--
-- TOC entry 200 (class 1259 OID 16385)
-- Name: purse_id_seq; Type: SEQUENCE; Schema: public; Owner: nest_transact_user
--

CREATE SEQUENCE public.purse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purse_id_seq OWNER TO nest_transact_user;

--
-- TOC entry 3008 (class 0 OID 0)
-- Dependencies: 200
-- Name: purse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nest_transact_user
--

ALTER SEQUENCE public.purse_id_seq OWNED BY public.purse.id;


--
-- TOC entry 203 (class 1259 OID 16396)
-- Name: user; Type: TABLE; Schema: public; Owner: nest_transact_user
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    name character varying NOT NULL,
    "defaultPurseId" integer
);


ALTER TABLE public."user" OWNER TO nest_transact_user;

--
-- TOC entry 202 (class 1259 OID 16394)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: nest_transact_user
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO nest_transact_user;

--
-- TOC entry 3009 (class 0 OID 0)
-- Dependencies: 202
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nest_transact_user
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 2857 (class 2604 OID 16390)
-- Name: purse id; Type: DEFAULT; Schema: public; Owner: nest_transact_user
--

ALTER TABLE ONLY public.purse ALTER COLUMN id SET DEFAULT nextval('public.purse_id_seq'::regclass);


--
-- TOC entry 2859 (class 2604 OID 16399)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: nest_transact_user
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 2999 (class 0 OID 16387)
-- Dependencies: 201
-- Data for Name: purse; Type: TABLE DATA; Schema: public; Owner: nest_transact_user
--

COPY public.purse (id, balance, "userId") FROM stdin;
1	1000	1
2	1000	2
\.


--
-- TOC entry 3001 (class 0 OID 16396)
-- Dependencies: 203
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: nest_transact_user
--

COPY public."user" (id, name, "defaultPurseId") FROM stdin;
1	USER 1	1
2	USER 2	2
\.


--
-- TOC entry 3010 (class 0 OID 0)
-- Dependencies: 200
-- Name: purse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nest_transact_user
--

SELECT pg_catalog.setval('public.purse_id_seq', 2, true);


--
-- TOC entry 3011 (class 0 OID 0)
-- Dependencies: 202
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nest_transact_user
--

SELECT pg_catalog.setval('public.user_id_seq', 2, true);


--
-- TOC entry 2861 (class 2606 OID 16393)
-- Name: purse PK_64d0b0e71c1213684fe6e99d877; Type: CONSTRAINT; Schema: public; Owner: nest_transact_user
--

ALTER TABLE ONLY public.purse
    ADD CONSTRAINT "PK_64d0b0e71c1213684fe6e99d877" PRIMARY KEY (id);


--
-- TOC entry 2863 (class 2606 OID 16404)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: nest_transact_user
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 2865 (class 2606 OID 16406)
-- Name: user REL_8cc9faec34c5d4c21903b1b02a; Type: CONSTRAINT; Schema: public; Owner: nest_transact_user
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "REL_8cc9faec34c5d4c21903b1b02a" UNIQUE ("defaultPurseId");


--
-- TOC entry 2867 (class 2606 OID 16412)
-- Name: user FK_8cc9faec34c5d4c21903b1b02ac; Type: FK CONSTRAINT; Schema: public; Owner: nest_transact_user
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_8cc9faec34c5d4c21903b1b02ac" FOREIGN KEY ("defaultPurseId") REFERENCES public.purse(id);


--
-- TOC entry 2866 (class 2606 OID 16407)
-- Name: purse FK_bd39d6b41508d60fe38380839f6; Type: FK CONSTRAINT; Schema: public; Owner: nest_transact_user
--

ALTER TABLE ONLY public.purse
    ADD CONSTRAINT "FK_bd39d6b41508d60fe38380839f6" FOREIGN KEY ("userId") REFERENCES public."user"(id);


-- Completed on 2022-04-28 01:52:28

--
-- PostgreSQL database dump complete
--

