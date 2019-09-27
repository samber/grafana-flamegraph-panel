DROP TABLE IF EXISTS statuses;
CREATE TABLE IF NOT EXISTS statuses (
	event_time DateTime, 
	metrics String, 
	status UInt8
) ENGINE MergeTree PARTITION BY toYYYYMMDD(event_time) ORDER BY event_time;

INSERT INTO statuses VALUES (toStartOfMinute(now()),'metric1',0), (toStartOfMinute(now())+60,'metric1',1); 
INSERT INTO statuses VALUES (toStartOfMinute(now()),'metric2',0), (toStartOfMinute(now())+60,'metric2',1); 

SELECT max(event_time) FROM statuses;

SYSTEM FLUSH LOGS;

SELECT arrayStringConcat(arrayReverse(arrayMap(x -> concat(demangle(addressToSymbol(x)), '#', addressToLine(x)), trace)), ';') AS stack, count() AS Value FROM system.trace_log GROUP BY trace ORDER BY Value DESC;

SELECT arrayStringConcat(arrayReverse(arrayMap(x -> concat(demangle(addressToSymbol(x)), '#', addressToLine(x)), trace)), ';') AS stack, count() AS Value FROM system.trace_log GROUP BY trace ORDER BY Value DESC;

SYSTEM FLUSH LOGS;
