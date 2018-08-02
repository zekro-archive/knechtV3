exports.fetchMember = (guild, identifier, bots) => {
    identifier = identifier.toLowerCase();

    var methods = [
        (m) => m.id == identifier || m.id == identifier.replace(/[<@!>]/gm, ""),
        (m) => m.user.username.toLowerCase() == identifier,
        (m) => m.user.username.toLowerCase().startsWith(identifier),
        (m) => m.user.username.toLowerCase().includes(identifier),
        (m) => m.displayName.toLowerCase() == identifier,
        (m) => m.displayName.toLowerCase().startsWith(identifier),
        (m) => m.displayName.toLowerCase().includes(identifier)
    ];

    for (var method of methods) {
        let out = guild.members.find(method);
        if (out && (!out.user.bot || bots))
            return out;
    }
}

exports.getTime = (date) => {
    function btf(inp) {
    	if (inp < 10)
	        return "0" + inp;
    	return inp;
    }
    var date = date ? date : (new Date()),
        y = date.getFullYear(),
        m = btf(date.getMonth() + 1),
	    d = btf(date.getDate()),
	    h = btf(date.getHours()),
	    min = btf(date.getMinutes()),
	    s = btf(date.getSeconds());
    return `${d}.${m}.${y} - ${h}:${min}:${s}`;
}

exports.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.createTable = (tablearray, space) => {
    if (!space)
        space = 2;

    function spaces(numb) {
        let out = '';
        for (let i = 0; i < numb; i++)
            out += ' ';
        return out;
    }

    let maxrowlens = [];
    tablearray.forEach((column, i) => {
        let max = 0;
        column.forEach(box => {
            let boxlen = box.length;
            if (boxlen > max)
                max = boxlen;
        });
        maxrowlens[i] = max;
    });
    
    let lines = [];
    tablearray.forEach((column, c) => {
        column.forEach((box, l) => {
            if (!lines[l])
                lines[l] = box + spaces(maxrowlens[c] - box.length + space);
            else
                lines[l] += box + spaces(maxrowlens[c] - box.length + space);
        });
    });

    return lines.join('\n');
}